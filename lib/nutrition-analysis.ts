import type { Food } from "./db";

// Daily Recommended Values (FDA 2,000 cal diet)
const DV = {
  calories: 2000,
  protein: 50,
  fat: 78,
  saturated_fat: 20,
  carbs: 275,
  fiber: 28,
  sugar: 50,
  sodium: 2300,
  cholesterol: 300,
  potassium: 4700,
  vitamin_c: 90,
  calcium: 1300,
  iron: 18,
};

export interface DietCompatibility {
  name: string;
  compatible: boolean;
  reason: string;
}

export interface NutrientDV {
  nutrient: string;
  value: number;
  dv: number;
  percent: number;
  level: "low" | "moderate" | "high" | "very_high";
}

export interface HealthAnalysis {
  summary: string;
  highlights: string[];
  concerns: string[];
  dietCompatibility: DietCompatibility[];
  dvBreakdown: NutrientDV[];
  calorieCategory: string;
  proteinCategory: string;
}

function dvPercent(value: number | null, daily: number): number {
  if (value === null || value === undefined) return 0;
  return Math.round((value / daily) * 100);
}

function dvLevel(percent: number): "low" | "moderate" | "high" | "very_high" {
  if (percent <= 5) return "low";
  if (percent <= 15) return "moderate";
  if (percent <= 40) return "high";
  return "very_high";
}

export function analyzeFood(f: Food): HealthAnalysis {
  const cal = f.calories || 0;
  const protein = f.protein || 0;
  const fat = f.fat || 0;
  const carbs = f.carbs || 0;
  const fiber = f.fiber || 0;
  const sugar = f.sugar || 0;
  const sodium = f.sodium || 0;
  const satFat = f.saturated_fat || 0;
  const cholesterol = f.cholesterol || 0;

  // Calorie category
  let calorieCategory = "moderate-calorie";
  if (cal < 50) calorieCategory = "very low-calorie";
  else if (cal < 100) calorieCategory = "low-calorie";
  else if (cal < 200) calorieCategory = "moderate-calorie";
  else if (cal < 400) calorieCategory = "high-calorie";
  else calorieCategory = "very high-calorie";

  // Protein category
  let proteinCategory = "moderate-protein";
  if (protein < 2) proteinCategory = "very low-protein";
  else if (protein < 5) proteinCategory = "low-protein";
  else if (protein < 15) proteinCategory = "moderate-protein";
  else if (protein < 25) proteinCategory = "high-protein";
  else proteinCategory = "very high-protein";

  // Highlights
  const highlights: string[] = [];
  if (protein >= 15) highlights.push(`High in protein (${protein.toFixed(1)}g per 100g)`);
  if (fiber >= 5) highlights.push(`Good source of fiber (${fiber.toFixed(1)}g per 100g)`);
  if (cal < 100) highlights.push(`Low in calories (${cal.toFixed(0)} kcal per 100g)`);
  if (f.vitamin_c && f.vitamin_c >= 15) highlights.push(`Contains vitamin C (${f.vitamin_c.toFixed(1)}mg)`);
  if (f.calcium && f.calcium >= 100) highlights.push(`Good source of calcium (${f.calcium.toFixed(0)}mg)`);
  if (f.iron && f.iron >= 2) highlights.push(`Contains iron (${f.iron.toFixed(1)}mg)`);
  if (f.potassium && f.potassium >= 300) highlights.push(`Good source of potassium (${f.potassium.toFixed(0)}mg)`);
  if (fat < 3 && cal > 0) highlights.push("Very low in fat");

  // Concerns
  const concerns: string[] = [];
  if (sodium >= 600) concerns.push(`High in sodium (${sodium.toFixed(0)}mg per 100g)`);
  if (sugar >= 20) concerns.push(`High in sugar (${sugar.toFixed(1)}g per 100g)`);
  if (satFat >= 5) concerns.push(`High in saturated fat (${satFat.toFixed(1)}g per 100g)`);
  if (cholesterol >= 100) concerns.push(`High in cholesterol (${cholesterol.toFixed(0)}mg per 100g)`);
  if (cal >= 400) concerns.push(`Very calorie-dense (${cal.toFixed(0)} kcal per 100g)`);

  // Diet compatibility
  const dietCompatibility: DietCompatibility[] = [
    {
      name: "Keto",
      compatible: carbs <= 5 && fat > protein,
      reason: carbs <= 5 ? `Only ${carbs.toFixed(1)}g net carbs — keto-friendly.` : `${carbs.toFixed(1)}g carbs is too high for strict keto (max ~5g per serving).`,
    },
    {
      name: "Low-Carb",
      compatible: carbs <= 15,
      reason: carbs <= 15 ? `${carbs.toFixed(1)}g carbs — suitable for low-carb diets.` : `${carbs.toFixed(1)}g carbs may be too high for low-carb diets.`,
    },
    {
      name: "High-Protein",
      compatible: protein >= 15,
      reason: protein >= 15 ? `${protein.toFixed(1)}g protein per 100g — great for muscle building.` : `Only ${protein.toFixed(1)}g protein — not ideal for high-protein goals.`,
    },
    {
      name: "Low-Fat",
      compatible: fat <= 3,
      reason: fat <= 3 ? `Only ${fat.toFixed(1)}g fat — fits low-fat diets.` : `${fat.toFixed(1)}g fat per 100g.`,
    },
    {
      name: "Low-Sodium",
      compatible: sodium <= 140,
      reason: sodium <= 140 ? `${sodium.toFixed(0)}mg sodium — heart-healthy choice.` : `${sodium.toFixed(0)}mg sodium — watch intake if limiting sodium.`,
    },
  ];

  // DV breakdown
  const dvBreakdown: NutrientDV[] = [
    { nutrient: "Calories", value: cal, dv: DV.calories, percent: dvPercent(cal, DV.calories), level: dvLevel(dvPercent(cal, DV.calories)) },
    { nutrient: "Protein", value: protein, dv: DV.protein, percent: dvPercent(protein, DV.protein), level: dvLevel(dvPercent(protein, DV.protein)) },
    { nutrient: "Total Fat", value: fat, dv: DV.fat, percent: dvPercent(fat, DV.fat), level: dvLevel(dvPercent(fat, DV.fat)) },
    { nutrient: "Saturated Fat", value: satFat, dv: DV.saturated_fat, percent: dvPercent(satFat, DV.saturated_fat), level: dvLevel(dvPercent(satFat, DV.saturated_fat)) },
    { nutrient: "Carbs", value: carbs, dv: DV.carbs, percent: dvPercent(carbs, DV.carbs), level: dvLevel(dvPercent(carbs, DV.carbs)) },
    { nutrient: "Fiber", value: fiber, dv: DV.fiber, percent: dvPercent(fiber, DV.fiber), level: dvLevel(dvPercent(fiber, DV.fiber)) },
    { nutrient: "Sugar", value: sugar, dv: DV.sugar, percent: dvPercent(sugar, DV.sugar), level: dvLevel(dvPercent(sugar, DV.sugar)) },
    { nutrient: "Sodium", value: sodium, dv: DV.sodium, percent: dvPercent(sodium, DV.sodium), level: dvLevel(dvPercent(sodium, DV.sodium)) },
    { nutrient: "Cholesterol", value: cholesterol, dv: DV.cholesterol, percent: dvPercent(cholesterol, DV.cholesterol), level: dvLevel(dvPercent(cholesterol, DV.cholesterol)) },
  ];

  // Summary
  const summaryParts: string[] = [];
  summaryParts.push(`${f.name} is a ${calorieCategory} food with ${cal.toFixed(0)} calories per 100g.`);
  if (highlights.length > 0) summaryParts.push(`It is ${highlights[0].toLowerCase()}.`);
  if (concerns.length > 0) summaryParts.push(`Note: ${concerns[0].toLowerCase()}.`);
  if (highlights.length === 0 && concerns.length === 0) {
    summaryParts.push(`It provides a balanced nutritional profile with ${protein.toFixed(1)}g protein, ${carbs.toFixed(1)}g carbs, and ${fat.toFixed(1)}g fat.`);
  }

  return {
    summary: summaryParts.join(" "),
    highlights,
    concerns,
    dietCompatibility,
    dvBreakdown,
    calorieCategory,
    proteinCategory,
  };
}
