import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFoodBySlug, getAllFoods, getSimilarFoods } from "@/lib/db";

interface Props { params: Promise<{ slug: string }> }

function fmt(v: number | null, unit = 'g'): string { return v !== null ? `${v.toFixed(1)}${unit}` : 'N/A'; }

export const dynamicParams = true;
export const revalidate = 86400;

export function generateStaticParams() {
  return getAllFoods().map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const f = getFoodBySlug(slug);
  if (!f) return {};
  return {
    title: `${f.name} — Calorías, Proteína y Datos Nutricionales`,
    description: `${f.name}: ${f.calories?.toFixed(0) || '?'} cal, ${fmt(f.protein)} proteína, ${fmt(f.carbs)} carbohidratos, ${fmt(f.fat)} grasa por 100g.`,
    alternates: {
      canonical: `/es/food/${slug}/`,
      languages: { en: `/food/${slug}`, es: `/es/food/${slug}`, "x-default": `/food/${slug}` },
    },
    openGraph: { url: `/es/food/${slug}/` },
  };
}

export default async function FoodPageEs({ params }: Props) {
  const { slug } = await params;
  const f = getFoodBySlug(slug);
  if (!f) notFound();

  const similar = getSimilarFoods(slug, f.category, 6);

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/es/" className="hover:underline">Inicio</a> / <a href="/es/food" className="hover:underline">Alimentos</a> / <span className="text-slate-800">{f.name}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{f.name}</h1>
      <p className="text-slate-500 mb-2">Información nutricional por porción de 100g</p>
      <p className="text-xs text-slate-400 mb-6">
        <a href={`/food/${slug}`} className="text-orange-500 hover:underline">English version</a>
      </p>

      {/* Macronutrientes */}
      <div className="bg-orange-50 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-slate-500">Calorías</div>
            <div className="text-3xl font-bold text-orange-600">{f.calories?.toFixed(0) || '-'}</div>
            <div className="text-xs text-slate-400">kcal</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Proteína</div>
            <div className="text-2xl font-bold text-blue-600">{fmt(f.protein)}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Carbohidratos</div>
            <div className="text-2xl font-bold text-green-600">{fmt(f.carbs)}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Grasa</div>
            <div className="text-2xl font-bold text-yellow-600">{fmt(f.fat)}</div>
          </div>
        </div>
      </div>

      {/* Tabla nutricional completa */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Información Nutricional Completa</h2>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          {[
            ['Calorías', f.calories, 'kcal'],
            ['Proteína', f.protein, 'g'],
            ['Grasa Total', f.fat, 'g'],
            ['Grasa Saturada', f.saturated_fat, 'g'],
            ['Carbohidratos', f.carbs, 'g'],
            ['Fibra', f.fiber, 'g'],
            ['Azúcar', f.sugar, 'g'],
            ['Sodio', f.sodium, 'mg'],
            ['Colesterol', f.cholesterol, 'mg'],
            ['Potasio', f.potassium, 'mg'],
            ['Vitamina C', f.vitamin_c, 'mg'],
            ['Calcio', f.calcium, 'mg'],
            ['Hierro', f.iron, 'mg'],
          ].map(([label, val, unit]) => (
            <div key={label as string} className="flex justify-between p-3 border-b border-slate-100 hover:bg-slate-50">
              <span className="text-sm">{label as string}</span>
              <span className="text-sm font-medium">{val !== null && val !== undefined ? `${(val as number).toFixed(1)} ${unit}` : 'N/A'}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Alimentos similares */}
      {similar.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Alimentos Similares</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {similar.map((s) => (
              <div key={s.slug} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg">
                <a href={`/es/food/${s.slug}`} className="text-sm text-orange-600 hover:underline">{s.name}</a>
                <span className="text-xs text-slate-500">{s.calories?.toFixed(0)} cal</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="text-xs text-slate-400 mt-8">Fuente: USDA FoodData Central. Valores por porción de 100g.</p>
    </div>
  );
}
