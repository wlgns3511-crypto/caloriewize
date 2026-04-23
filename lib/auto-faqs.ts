import type { Food } from './db';

export interface FaqItem {
  question: string;
  answer: string;
}

function fmt(v: number | null, unit = 'g'): string {
  return v !== null ? `${v.toFixed(1)}${unit}` : 'N/A';
}

/** Daily values for a 2,000 kcal diet (FDA reference) */
const DV = {
  calories: 2000,
  protein: 50,
  fat: 78,
  carbs: 275,
  fiber: 28,
  sodium: 2300, // mg
  cholesterol: 300, // mg
  sugar: 50,
  saturated_fat: 20,
  potassium: 4700, // mg
  vitamin_c: 90, // mg
  calcium: 1300, // mg
  iron: 18, // mg
};

function dvPct(val: number | null, dv: number): number | null {
  if (val === null) return null;
  return Math.round((val / dv) * 100);
}

export function generateAutoFaqs(f: Food): FaqItem[] {
  return [];
}
