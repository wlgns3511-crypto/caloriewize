import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLowCalorieFoods, getHighProteinFoods } from "@/lib/db";
import { itemListSchema, datasetSchema } from "@/lib/schema";

const LISTS: Record<string, { title: string; desc: string; getter: (n: number) => ReturnType<typeof getLowCalorieFoods> }> = {
  'low-calorie': { title: 'Low Calorie Foods', desc: 'Foods with the fewest calories per 100g serving.', getter: getLowCalorieFoods },
  'high-protein': { title: 'High Protein Foods', desc: 'Foods with the most protein per 100g serving.', getter: getHighProteinFoods },
};

interface Props { params: Promise<{ type: string }> }

export function generateStaticParams() {
  return Object.keys(LISTS).map((type) => ({ type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const list = LISTS[type];
  if (!list) return {};
  return { title: list.title, description: list.desc };
}

export default async function ListPage({ params }: Props) {
  const { type } = await params;
  const list = LISTS[type];
  if (!list) notFound();
  const foods = list.getter(50);

  const listItems = foods.map(f => ({ name: f.name, url: `/food/${f.slug}` }));

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema(list.title, `/list/${type}`, listItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema(list.title, list.desc, `/list/${type}`)) }} />
      <h1 className="text-3xl font-bold mb-2">{list.title}</h1>
      <p className="text-slate-600 mb-6">{list.desc}</p>
      <div className="border rounded-lg overflow-hidden">
        {foods.map((f, i) => (
          <a key={f.slug} href={`/food/${f.slug}`} className="flex justify-between p-3 hover:bg-orange-50 border-b border-slate-100 text-sm">
            <span><span className="text-slate-400 mr-2">{i + 1}.</span>{f.name}</span>
            <span className="font-medium">{type === 'high-protein' ? `${f.protein?.toFixed(1)}g protein` : `${f.calories?.toFixed(0)} cal`}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
