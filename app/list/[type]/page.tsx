/**
 * /list/[type]/  — caloriewize HCU 5-chunk patch (2026-04-28).
 *
 * Expanded from 2 list types to 15 to match the queries users actually search:
 *   "low calorie foods", "high protein foods", "high fiber foods", etc.
 *
 * Each list:
 *   - Pulls top-50 (or top-100 if large enough) from SQL by the relevant column
 *   - Layer 2 narrative (LIST_PROFILES in food-cluster-insights.ts)
 *   - Layer 1 stats: median, p90, count
 *   - Schema: ItemList + Dataset
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Database from 'better-sqlite3';
import path from 'path';
import type { Food } from "@/lib/db";
import { itemListSchema, datasetSchema } from "@/lib/schema";
import { getListInsight, getAllListTypes, type ListType } from "@/lib/food-cluster-insights";
import { fmtCount, fmtNutrient } from "@/lib/content-helpers";
import { FreshnessTag } from "@/components/FreshnessTag";
import { AuthorBox } from "@/components/AuthorBox";

const DB_PATH = path.join(process.cwd(), 'data', 'food.db');
let _db: Database.Database | null = null;
function getDb(): Database.Database {
  if (!_db) _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  return _db;
}

interface Props { params: Promise<{ type: string }> }

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllListTypes().map((type) => ({ type }));
}

// ──────────────────────────────────────────────────────────────────
// Per-list SQL strategy
// ──────────────────────────────────────────────────────────────────

interface ListQuery {
  /** Sort column for the SQL query. */
  sortColumn: keyof Food | 'protein_to_cal';
  direction: 'ASC' | 'DESC';
  /** Optional WHERE additions beyond NOT NULL on the sort column. */
  whereClauses: string[];
  /** Display column for the right-hand value, e.g. "calories", "protein". */
  displayColumn: keyof Food;
  displayUnit: string;
  /** When ≥1 → include only items satisfying that minimum on the display col. */
  displayMinValue?: number;
  /** Default fetch size. */
  limit: number;
}

const LIST_QUERIES: Record<ListType, ListQuery> = {
  'low-calorie':              { sortColumn: 'calories',      direction: 'ASC',  whereClauses: ['calories > 0'], displayColumn: 'calories', displayUnit: 'kcal', limit: 60 },
  'high-protein':             { sortColumn: 'protein',       direction: 'DESC', whereClauses: [],               displayColumn: 'protein',  displayUnit: 'g',    limit: 60 },
  'high-fiber':               { sortColumn: 'fiber',         direction: 'DESC', whereClauses: [],               displayColumn: 'fiber',    displayUnit: 'g',    limit: 60 },
  'low-sodium':               { sortColumn: 'sodium',        direction: 'ASC',  whereClauses: ['sodium >= 0'],  displayColumn: 'sodium',   displayUnit: 'mg',   limit: 60 },
  'low-sugar':                { sortColumn: 'sugar',         direction: 'ASC',  whereClauses: ['sugar >= 0'],   displayColumn: 'sugar',    displayUnit: 'g',    limit: 60 },
  'low-fat':                  { sortColumn: 'fat',           direction: 'ASC',  whereClauses: ['fat >= 0'],     displayColumn: 'fat',      displayUnit: 'g',    limit: 60 },
  'low-carb':                 { sortColumn: 'carbs',         direction: 'ASC',  whereClauses: ['carbs >= 0'],   displayColumn: 'carbs',    displayUnit: 'g',    limit: 60 },
  'high-vitamin-c':           { sortColumn: 'vitamin_c',     direction: 'DESC', whereClauses: [],               displayColumn: 'vitamin_c', displayUnit: 'mg',  limit: 60 },
  'high-calcium':             { sortColumn: 'calcium',       direction: 'DESC', whereClauses: [],               displayColumn: 'calcium',  displayUnit: 'mg',   limit: 60 },
  'high-iron':                { sortColumn: 'iron',          direction: 'DESC', whereClauses: [],               displayColumn: 'iron',     displayUnit: 'mg',   limit: 60 },
  'high-potassium':           { sortColumn: 'potassium',     direction: 'DESC', whereClauses: [],               displayColumn: 'potassium', displayUnit: 'mg',  limit: 60 },
  'low-cholesterol':          { sortColumn: 'cholesterol',   direction: 'ASC',  whereClauses: ['cholesterol >= 0'], displayColumn: 'cholesterol', displayUnit: 'mg', limit: 60 },
  'low-saturated-fat':        { sortColumn: 'saturated_fat', direction: 'ASC',  whereClauses: ['saturated_fat >= 0'], displayColumn: 'saturated_fat', displayUnit: 'g', limit: 60 },
  'ultra-low-calorie':        { sortColumn: 'calories',      direction: 'ASC',  whereClauses: ['calories > 0', 'calories < 30'], displayColumn: 'calories', displayUnit: 'kcal', limit: 60 },
  // protein-to-calorie ratio: filter ≥15g protein and ≤150 kcal, then order by ratio.
  'high-protein-low-calorie': { sortColumn: 'protein_to_cal', direction: 'DESC', whereClauses: ['protein >= 15', 'calories <= 150', 'calories > 0'], displayColumn: 'protein', displayUnit: 'g', limit: 60 },
};

function fetchListFoods(type: ListType): Food[] {
  const q = LIST_QUERIES[type];
  const db = getDb();
  const where = [
    q.sortColumn === 'protein_to_cal'
      ? 'protein IS NOT NULL AND calories IS NOT NULL'
      : `${q.sortColumn} IS NOT NULL`,
    ...q.whereClauses,
  ].join(' AND ');
  const orderBy = q.sortColumn === 'protein_to_cal'
    ? `(protein * 1.0 / calories) ${q.direction}`
    : `${q.sortColumn} ${q.direction}`;
  return db.prepare(
    `SELECT * FROM foods WHERE ${where} ORDER BY ${orderBy}, fdc_id ASC LIMIT ?`
  ).all(q.limit) as Food[];
}

function statsFor(type: ListType, foods: Food[]): { median: number; p90: number; count: number } {
  const q = LIST_QUERIES[type];
  const col = q.displayColumn as keyof Food;
  const values = foods
    .map((f) => f[col] as number | null)
    .filter((v): v is number => v != null && isFinite(v))
    .sort((a, b) => a - b);
  if (!values.length) return { median: 0, p90: 0, count: 0 };
  return {
    median: values[Math.floor(values.length / 2)],
    p90: values[Math.floor(values.length * 0.9)] ?? values[values.length - 1],
    count: values.length,
  };
}

// ──────────────────────────────────────────────────────────────────
// Metadata
// ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  if (!getAllListTypes().includes(type as ListType)) return {};
  const meta = getListInsight(type as ListType);
  // ≤60 chars: "Low-calorie foods: 60 picks (USDA)"
  const title = `${meta.title}: ${LIST_QUERIES[type as ListType].limit} picks (USDA)`;
  return {
    title: title.length > 60 ? `${meta.title} (USDA, top picks)` : title,
    description: `${meta.subtitle}. USDA FoodData Central — ${LIST_QUERIES[type as ListType].limit} foods sorted, with calories, protein, and full nutrition per 100 g.`,
    alternates: { canonical: `/list/${type}/` },
    openGraph: { url: `/list/${type}/` },
  };
}

// ──────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────

export default async function ListPage({ params }: Props) {
  const { type } = await params;
  if (!getAllListTypes().includes(type as ListType)) notFound();
  const listType = type as ListType;
  const meta = getListInsight(listType);
  const q = LIST_QUERIES[listType];
  const foods = fetchListFoods(listType);
  const stats = statsFor(listType, foods);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Food lists", url: "/list" },
    { name: meta.title, url: `/list/${type}/` },
  ];

  const listItems = foods.map((f) => ({ name: f.name, url: `/food/${f.slug}/` }));

  // Cross-link to other lists for internal traffic
  const otherLists = getAllListTypes().filter((t) => t !== listType);

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        {breadcrumbs.map((b, i) => (
          <span key={i}>
            {i > 0 && " / "}
            {i < breadcrumbs.length - 1 ? (
              <a href={b.url} className="hover:underline">{b.name}</a>
            ) : (
              <span className="text-slate-800">{b.name}</span>
            )}
          </span>
        ))}
      </nav>

      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{meta.title}</h1>
        <p className="text-slate-600">{meta.subtitle} · USDA FoodData Central · {fmtCount(foods.length)} items</p>
      </header>

      {/* Layer 2 — narrative intro */}
      <section className="mb-8" data-upgrade="list-intro">
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-slate-700 leading-relaxed space-y-4">
          <p>{meta.intro}</p>
          <p>{meta.context}</p>
          <p className="text-sm text-slate-500"><strong>Note:</strong> {meta.caveats}</p>
        </div>
      </section>

      {/* Layer 1 — list stats */}
      {stats.count > 0 && (
        <section className="mb-8" data-upgrade="list-stats">
          <h2 className="text-xl font-bold mb-3">List at a glance</h2>
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Median"
              value={`${stats.median.toFixed(q.displayUnit === 'kcal' || q.displayUnit === 'mg' ? 0 : 1)} ${q.displayUnit}`}
              sub={`per 100 g`}
            />
            <StatCard
              label={q.direction === 'DESC' ? 'Top 10%' : 'Bottom 10%'}
              value={`${stats.p90.toFixed(q.displayUnit === 'kcal' || q.displayUnit === 'mg' ? 0 : 1)} ${q.displayUnit}`}
              sub={`per 100 g`}
            />
            <StatCard
              label="Items shown"
              value={fmtCount(stats.count)}
              sub={`with reported values`}
            />
          </div>
        </section>
      )}

      {/* Ranked list */}
      <section className="mb-8" data-upgrade="ranked-list">
        <h2 className="text-xl font-bold mb-3">Top {fmtCount(foods.length)} {meta.title.toLowerCase()}</h2>
        <p className="text-sm text-slate-500 mb-3">
          Ranked by {q.sortColumn === 'protein_to_cal' ? 'protein-to-calorie ratio' : (q.sortColumn as string).replace('_', ' ')}, {q.direction === 'ASC' ? 'lowest first' : 'highest first'}. Tap any item for full nutrition profile.
        </p>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          {foods.map((f, i) => {
            const value = f[q.displayColumn] as number | null;
            const display = value != null
              ? `${value.toFixed(q.displayUnit === 'kcal' || q.displayUnit === 'mg' ? 0 : 1)} ${q.displayUnit}`
              : '—';
            const cal = f.calories?.toFixed(0) ?? '—';
            return (
              <a
                key={f.slug}
                href={`/food/${f.slug}/`}
                className="flex justify-between items-center p-3 hover:bg-orange-50 border-b border-slate-100 text-sm last:border-b-0"
              >
                <span className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-slate-400 w-6 flex-shrink-0">{i + 1}.</span>
                  <span className="text-slate-800 truncate">{f.name}</span>
                  {f.category && (
                    <span className="text-xs text-slate-400 hidden sm:inline truncate">
                      · {f.category.replace(/-/g, ' ')}
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-slate-500">{cal} cal</span>
                  <span className="font-medium text-slate-800 w-20 text-right">{display}</span>
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* Cross-list links */}
      <section className="mb-8" data-upgrade="other-lists">
        <h2 className="text-xl font-bold mb-3">Other food lists</h2>
        <div className="flex flex-wrap gap-2">
          {otherLists.map((t) => {
            const m = getListInsight(t);
            return (
              <a
                key={t}
                href={`/list/${t}/`}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-full text-sm hover:bg-orange-50 hover:border-orange-200"
              >
                {m.title}
              </a>
            );
          })}
        </div>
      </section>

      <AuthorBox />
      <FreshnessTag source="USDA FoodData Central (CC0 public domain, nutrient data)" />

      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema(meta.title, `/list/${type}`, listItems)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema(meta.title, meta.subtitle, `/list/${type}`)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: breadcrumbs.map((b, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: b.name,
              item: `https://caloriewize.com${b.url}`,
            })),
          }),
        }}
      />
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="p-3 bg-slate-50 rounded-lg">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
    </div>
  );
}
