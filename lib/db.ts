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

export function getTopComparisons(limit = 500): { slugA: string; slugB: string }[] {
  const top = getDb().prepare('SELECT slug FROM foods WHERE calories IS NOT NULL ORDER BY fdc_id LIMIT 100').all() as { slug: string }[];
  const pairs: { slugA: string; slugB: string }[] = [];
  for (let i = 0; i < top.length && pairs.length < limit; i++) {
    for (let j = i + 1; j < top.length && pairs.length < limit; j++) {
      const [a, b] = [top[i].slug, top[j].slug].sort();
      pairs.push({ slugA: a, slugB: b });
    }
  }
  return pairs;
}

export function countFoods(): number {
  return (getDb().prepare('SELECT COUNT(*) as c FROM foods').get() as { c: number }).c;
}
