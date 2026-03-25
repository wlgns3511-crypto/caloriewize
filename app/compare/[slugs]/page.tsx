import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFoodBySlug, getTopComparisons } from "@/lib/db";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";

interface Props { params: Promise<{ slugs: string }> }

function parseSlugs(s: string): [string, string] | null {
  const m = s.match(/^(.+)-vs-(.+)$/);
  return m ? [m[1], m[2]] : null;
}

function fmt(v: number | null, unit = 'g'): string { return v !== null ? `${v.toFixed(1)}${unit}` : 'N/A'; }

export const dynamicParams = true;

export async function generateStaticParams() {
  return getTopComparisons(2000).map((p) => {
    const [a, b] = [p.slugA, p.slugB].sort();
    return { slugs: `${a}-vs-${b}` };
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);
  if (!parsed) return {};
  const a = getFoodBySlug(parsed[0]), b = getFoodBySlug(parsed[1]);
  if (!a || !b) return {};
  return {
    title: `${a.name} vs ${b.name} - Nutrition Comparison`,
    description: `Compare ${a.name} (${a.calories?.toFixed(0)} cal) vs ${b.name} (${b.calories?.toFixed(0)} cal). Side-by-side nutrition facts.`,
    alternates: { canonical: `/compare/${slugs}` },
  };
}

export default async function ComparePage({ params }: Props) {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);
  if (!parsed) notFound();
  const a = getFoodBySlug(parsed[0]), b = getFoodBySlug(parsed[1]);
  if (!a || !b) notFound();

  const winner = (a.calories || 0) < (b.calories || 0) ? a : b;
  const rows: [string, number | null, number | null, string][] = [
    ['Calories', a.calories, b.calories, 'kcal'],
    ['Protein', a.protein, b.protein, 'g'],
    ['Total Fat', a.fat, b.fat, 'g'],
    ['Carbs', a.carbs, b.carbs, 'g'],
    ['Fiber', a.fiber, b.fiber, 'g'],
    ['Sugar', a.sugar, b.sugar, 'g'],
    ['Sodium', a.sodium, b.sodium, 'mg'],
    ['Cholesterol', a.cholesterol, b.cholesterol, 'mg'],
    ['Potassium', a.potassium, b.potassium, 'mg'],
  ];

  const faqs = [
    { question: `Which has fewer calories, ${a.name} or ${b.name}?`, answer: `${winner.name} has fewer calories with ${winner.calories?.toFixed(0)} cal per 100g compared to ${winner === a ? b.calories?.toFixed(0) : a.calories?.toFixed(0)} cal.` },
  ];

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a> / <a href="/compare" className="hover:underline">Compare</a> / <span className="text-slate-800">{a.name} vs {b.name}</span>
      </nav>
      <h1 className="text-3xl font-bold mb-6">{a.name} vs {b.name}</h1>

      <div className="bg-orange-50 rounded-lg p-4 mb-6 text-center">
        <span className="font-bold text-orange-700">{winner.name}</span> has fewer calories ({winner.calories?.toFixed(0)} cal per 100g)
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead><tr className="bg-slate-100">
            <th className="text-left p-3">Nutrient</th>
            <th className="text-right p-3">{a.name}</th>
            <th className="text-right p-3">{b.name}</th>
          </tr></thead>
          <tbody>
            {rows.map(([label, va, vb, unit]) => (
              <tr key={label} className="border-b border-slate-200">
                <td className="p-3">{label}</td>
                <td className={`p-3 text-right ${va !== null && vb !== null && va < vb ? 'font-bold text-green-600' : ''}`}>{va !== null ? `${va.toFixed(1)} ${unit}` : '-'}</td>
                <td className={`p-3 text-right ${va !== null && vb !== null && vb < va ? 'font-bold text-green-600' : ''}`}>{vb !== null ? `${vb.toFixed(1)} ${unit}` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-8">
        {faqs.map((faq, i) => (
          <details key={i} className="border border-slate-200 rounded-lg mb-2" open>
            <summary className="p-4 cursor-pointer font-medium">{faq.question}</summary>
            <div className="px-4 pb-4 text-slate-600">{faq.answer}</div>
          </details>
        ))}
      </section>

      <div className="flex gap-4 mt-6">
        <a href={`/food/${parsed[0]}`} className="text-orange-600 hover:underline">{a.name} nutrition &rarr;</a>
        <a href={`/food/${parsed[1]}`} className="text-orange-600 hover:underline">{b.name} nutrition &rarr;</a>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
    </div>
  );
}
