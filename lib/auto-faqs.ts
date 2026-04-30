import type { Food } from './db';

export interface FaqItem {
  question: string;
  answer: string;
}

function fmt(v: number | null, unit = 'g', digits = 1): string {
  return v !== null ? `${v.toFixed(digits)}${unit}` : 'N/A';
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

/**
 * 2026-04-24 — Previously returned `[]` (placeholder). GSC data showed top
 * queries like "watermelon calories 100g" (83 impressions, CTR 0%) — we
 * weren't earning the featured snippet because we had no FAQ schema at all.
 *
 * This generator produces 5-7 Q&A pairs per food with DIRECT numeric answers
 * in the first sentence, which is the featured-snippet extraction pattern
 * Google favors. Each answer leads with the number so the snippet box can
 * pull the first sentence cleanly.
 */
export function generateAutoFaqs(f: Food): FaqItem[] {
  const faqs: FaqItem[] = [];
  const name = f.name;

  // Q1 — THE calories question (top GSC query pattern)
  if (f.calories !== null) {
    const pct = dvPct(f.calories, DV.calories);
    faqs.push({
      question: `How many calories are in ${name} per 100g?`,
      answer: `${name} contains ${f.calories.toFixed(0)} calories per 100 grams${
        pct !== null ? ` (about ${pct}% of the 2,000 kcal daily value)` : ''
      }. This value comes from the USDA FoodData Central database.`,
    });
  }

  // Q2 — Protein
  if (f.protein !== null) {
    const pct = dvPct(f.protein, DV.protein);
    faqs.push({
      question: `How much protein is in ${name} per 100g?`,
      answer: `${name} provides ${fmt(f.protein)} of protein per 100 grams${
        pct !== null ? `, which is approximately ${pct}% of the recommended daily intake (50 g for a 2,000 kcal diet)` : ''
      }.`,
    });
  }

  // Q3 — Carbs + fiber
  if (f.carbs !== null) {
    const netCarbs = f.fiber !== null ? Math.max(0, f.carbs - f.fiber) : null;
    faqs.push({
      question: `How many carbs does ${name} have per 100g?`,
      answer: `${name} has ${fmt(f.carbs)} of total carbohydrates per 100 grams${
        f.fiber !== null ? `, including ${fmt(f.fiber)} of dietary fiber` : ''
      }${netCarbs !== null ? ` (net carbs: ${netCarbs.toFixed(1)}g)` : ''}.`,
    });
  }

  // Q4 — Fat
  if (f.fat !== null) {
    faqs.push({
      question: `How much fat is in ${name} per 100g?`,
      answer: `${name} contains ${fmt(f.fat)} of total fat per 100 grams${
        f.saturated_fat !== null ? `, with ${fmt(f.saturated_fat)} from saturated fat` : ''
      }${f.cholesterol !== null ? ` and ${fmt(f.cholesterol, 'mg', 0)} of cholesterol` : ''}.`,
    });
  }

  // Q5 — Diet-fit judgment (helps long-tail "is X keto/low-carb/high-protein")
  if (f.calories !== null) {
    const isLowCal = f.calories < 100;
    const isHighProtein = f.protein !== null && f.protein >= 15;
    const isLowCarb = f.carbs !== null && f.carbs < 10;
    const traits: string[] = [];
    if (isLowCal) traits.push('low-calorie');
    if (isHighProtein) traits.push('high-protein');
    if (isLowCarb) traits.push('low-carb');
    const summary = traits.length > 0
      ? `${name} can be considered a ${traits.join(', ')} food.`
      : `${name} is a moderate-density food — check your daily macro targets before adding it.`;
    faqs.push({
      question: `Is ${name} healthy?`,
      answer: `${summary} Per 100g it has ${f.calories.toFixed(0)} kcal${
        f.protein !== null ? `, ${fmt(f.protein)} protein` : ''
      }${f.carbs !== null ? `, ${fmt(f.carbs)} carbs` : ''}${
        f.fat !== null ? `, and ${fmt(f.fat)} fat` : ''
      }. Healthy depends on your overall diet, but the macros give a quick sanity check.`,
    });
  }

  // Q6 — Sodium (helpful when present, skip for fresh produce where sodium is zero)
  if (f.sodium !== null && f.sodium >= 50) {
    const pct = dvPct(f.sodium, DV.sodium);
    faqs.push({
      question: `How much sodium is in ${name}?`,
      answer: `${name} contains ${f.sodium.toFixed(0)} mg of sodium per 100 grams${
        pct !== null ? `, about ${pct}% of the recommended daily limit (2,300 mg)` : ''
      }.`,
    });
  }

  // Q7 — Serving-size disambiguation (many searches are "calories in 1 cup X")
  if (f.calories !== null && f.serving_size) {
    faqs.push({
      question: `What's the serving size for ${name}?`,
      answer: `The USDA reference serving for ${name} is ${f.serving_size}. All values on this page are normalized to 100 grams so you can compare foods directly.`,
    });
  }

  return faqs;
}
