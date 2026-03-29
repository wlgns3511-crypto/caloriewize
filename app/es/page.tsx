import type { Metadata } from "next";
import { getAllCategories, countFoods } from "@/lib/db";

export const metadata: Metadata = {
  title: "CalorieWize - Calorías e Información Nutricional",
  description: "Encuentra calorías e información nutricional de miles de alimentos. Datos del USDA.",
  alternates: {
    canonical: "/es/",
    languages: { en: "/", es: "/es/", "x-default": "/" },
  },
};

export default function HomeEs() {
  const categories = getAllCategories();
  const total = countFoods();

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        Calorías e Información Nutricional
      </h1>
      <p className="text-slate-600 mb-2">
        Encuentra información nutricional de {total}+ alimentos. Calorías, proteína, carbohidratos, grasa y más. Datos del USDA.
      </p>
      <p className="text-xs text-slate-400 mb-8">
        <a href="/" className="text-orange-500 hover:underline">English version</a>
      </p>

      {categories.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Explorar por Categoría</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <a
                key={cat.slug}
                href={`/es/category/${cat.slug}`}
                className="px-3 py-1 rounded-full border border-slate-200 text-sm hover:bg-orange-50 hover:border-orange-300"
              >
                {cat.name}
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
