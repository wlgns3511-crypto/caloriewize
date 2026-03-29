import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'food.db');
let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
  return _db;
}

export interface Food {
  fdc_id: number;
  name: string;
  slug: string;
  category: string | null;
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  cholesterol: number | null;
  saturated_fat: number | null;
  potassium: number | null;
  vitamin_c: number | null;
  calcium: number | null;
  iron: number | null;
  serving_size: string | null;
}

export interface Category { slug: string; name: string; }

export function getAllFoods(): Food[] {
  return getDb().prepare('SELECT * FROM foods ORDER BY name').all() as Food[];
}

export function getFoodBySlug(slug: string): Food | undefined {
  return getDb().prepare('SELECT * FROM foods WHERE slug = ?').get(slug) as Food | undefined;
}

export function getFoodsByCategory(catSlug: string): Food[] {
  return getDb().prepare('SELECT * FROM foods WHERE category = ? ORDER BY name').all(catSlug) as Food[];
}

export function getAllCategories(): Category[] {
  return getDb().prepare('SELECT * FROM categories ORDER BY name').all() as Category[];
}

export function getLowCalorieFoods(limit = 20): Food[] {
  return getDb().prepare('SELECT * FROM foods WHERE calories IS NOT NULL AND calories > 0 ORDER BY calories ASC LIMIT ?').all(limit) as Food[];
}

export function getHighProteinFoods(limit = 20): Food[] {
  return getDb().prepare('SELECT * FROM foods WHERE protein IS NOT NULL ORDER BY protein DESC LIMIT ?').all(limit) as Food[];
}

export function getSimilarFoods(slug: string, category: string | null, limit = 8): Food[] {
  if (!category) return [];
  return getDb().prepare('SELECT * FROM foods WHERE category = ? AND slug != ? ORDER BY calories LIMIT ?').all(category, slug, limit) as Food[];
}

export function getTopComparisons(limit = 5000): { slugA: string; slugB: string }[] {
  const db = getDb();
  // Use comparisons table if it exists (populated by scripts/expand-comparisons.py)
  const tableExists = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='comparisons'"
  ).get();

  if (tableExists) {
    return db.prepare(
      'SELECT slugA, slugB FROM comparisons LIMIT ?'
    ).all(limit) as { slugA: string; slugB: string }[];
  }

  // Fallback: generate in-memory from categories + top foods
  const pairSet = new Set<string>();
  const pairs: { slugA: string; slugB: string }[] = [];

  function addPair(a: string, b: string) {
    const [x, y] = [a, b].sort();
    const key = `${x}|${y}`;
    if (pairSet.has(key)) return;
    pairSet.add(key);
    pairs.push({ slugA: x, slugB: y });
  }

  const categories = db.prepare(
    'SELECT DISTINCT category FROM foods WHERE category IS NOT NULL AND calories IS NOT NULL'
  ).all() as { category: string }[];

  for (const { category } of categories) {
    const foods = db.prepare(
      'SELECT slug FROM foods WHERE category = ? AND calories IS NOT NULL ORDER BY name LIMIT 30'
    ).all(category) as { slug: string }[];
    for (let i = 0; i < foods.length && pairs.length < limit; i++) {
      for (let j = i + 1; j < foods.length && pairs.length < limit; j++) {
        addPair(foods[i].slug, foods[j].slug);
      }
    }
  }

  const top100 = db.prepare(
    'SELECT slug FROM foods WHERE calories IS NOT NULL ORDER BY fdc_id LIMIT 100'
  ).all() as { slug: string }[];
  for (let i = 0; i < top100.length && pairs.length < limit; i++) {
    for (let j = i + 1; j < top100.length && pairs.length < limit; j++) {
      addPair(top100[i].slug, top100[j].slug);
    }
  }

  return pairs.slice(0, limit);
}

export function countComparisons(): number {
  const db = getDb();
  const tableExists = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='comparisons'"
  ).get();
  if (!tableExists) return 0;
  return (db.prepare('SELECT COUNT(*) as c FROM comparisons').get() as { c: number }).c;
}

export function countFoods(): number {
  return (getDb().prepare('SELECT COUNT(*) as c FROM foods').get() as { c: number }).c;
}

export function getPopularFoods(limit = 10): Food[] {
  return getDb().prepare('SELECT * FROM foods WHERE calories IS NOT NULL ORDER BY fdc_id LIMIT ?').all(limit) as Food[];
}

export function getFoodsBySimilarCalories(food: Food, limit = 6): Food[] {
  if (food.calories == null) return [];
  return getDb().prepare(
    'SELECT * FROM foods WHERE slug != ? AND calories IS NOT NULL AND category != ? ORDER BY ABS(calories - ?) LIMIT ?'
  ).all(food.slug, food.category ?? '', food.calories, limit) as Food[];
}

