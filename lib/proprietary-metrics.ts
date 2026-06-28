import type { Food } from "./db";

export interface ProprietaryMetrics {
  satietyScore: number;
  dietGrade: string;
  commentary: string;
}

/**
 * Calculates a proprietary satiety score (0 - 100) based on macronutrient density.
 * Protein and fiber increase satiety; sugars and saturated fats decrease it.
 * Calorie density acts as a scaling factor.
 */
export function calculateSatietyScore(f: Food): number {
  const calories = f.calories ?? 0;
  const protein = f.protein ?? 0;
  const fiber = f.fiber ?? 0;
  const sugar = f.sugar ?? 0;
  const satFat = f.saturated_fat ?? 0;

  // Base score
  let score = 50;

  // Protein bonus (most satiating macro)
  // 15g protein gets full +25
  score += Math.min(25, protein * 1.67);

  // Fiber bonus (adds bulk, slows gastric emptying)
  // 5g fiber gets full +20
  score += Math.min(20, fiber * 4.0);

  // Sugar penalty (causes rapid insulin spikes and hunger crashes)
  // 15g sugar gets full -15
  score -= Math.min(15, sugar * 1.0);

  // Saturated fat penalty (high calorie density, low volume satiety)
  // 10g sat fat gets full -15
  score -= Math.min(15, satFat * 1.5);

  // Calorie density adjustment
  if (calories > 0) {
    if (calories < 100) {
      score += 15; // Low-calorie foods are volume-friendly
    } else if (calories > 350) {
      score -= 15; // Energy-dense foods have low volume satiety
    }
  }

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Assigns a weight-loss diet friendliness grade (A+ to F) using satiety score
 * adjusted for absolute calories, sodium, and key macronutrient thresholds.
 */
export function calculateDietGrade(f: Food, satietyScore: number): string {
  const calories = f.calories ?? 0;
  const protein = f.protein ?? 0;
  const fiber = f.fiber ?? 0;
  const sugar = f.sugar ?? 0;
  const sodium = f.sodium ?? 0;

  // Initial grade mapping based on satiety score
  let gradeVal = 0; // 0 = F, 1 = D, 2 = C, 3 = B, 4 = A
  if (satietyScore >= 85) gradeVal = 4;
  else if (satietyScore >= 70) gradeVal = 3;
  else if (satietyScore >= 50) gradeVal = 2;
  else if (satietyScore >= 35) gradeVal = 1;
  else gradeVal = 0;

  // Sub-grade offset (0 = minus, 1 = flat, 2 = plus)
  let subGrade = 1;

  // Positive qualifiers
  if (calories > 0 && calories < 100) subGrade += 1;
  if (protein >= 15) subGrade += 1;
  if (fiber >= 5) subGrade += 1;

  // Negative qualifiers
  if (calories > 350) subGrade -= 1;
  if (sugar > 20) subGrade -= 1;
  if (sodium > 600) subGrade -= 1;

  // Apply modifiers
  let finalGradeVal = gradeVal;
  if (subGrade > 2) {
    finalGradeVal = Math.min(4, gradeVal + 1);
    subGrade = 0; // e.g. A- or B flat
  } else if (subGrade < 0) {
    finalGradeVal = Math.max(0, gradeVal - 1);
    subGrade = 2; // e.g. B+ or C+
  }

  // Map to string representation
  const grades = ["F", "D", "C", "B", "A"];
  const baseGrade = grades[finalGradeVal];
  
  if (baseGrade === "F") return "F";
  if (baseGrade === "A" && subGrade === 2) return "A+";

  const subSigns = ["-", "", "+"];
  return `${baseGrade}${subSigns[subGrade]}`;
}

/**
 * Deterministic hash to distribute content templates evenly across all slugs
 */
function getSlugHash(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates unique, SEO-friendly commentary analyzing satiety and diet friendliness
 */
export function generateProprietaryCommentary(
  f: Food,
  score: number,
  grade: string
): string {
  const name = f.name;
  const calories = f.calories?.toFixed(0) ?? "0";
  const protein = f.protein?.toFixed(1) ?? "0.0";
  const fiber = f.fiber?.toFixed(1) ?? "0.0";
  const sugar = f.sugar?.toFixed(1) ?? "0.0";

  const hash = getSlugHash(f.slug);
  const variant = hash % 4;

  const verdict = score >= 75 ? "highly efficient" : score >= 50 ? "moderate, sensible" : "dense and calorie-heavy";
  const densityType = (f.calories ?? 0) < 150 ? "low-density, high-volume" : "compact, high-energy";
  const useCase = score >= 70 ? "appetite suppression and lean muscle retention" : "quick pre-workout energy or recovery";

  switch (variant) {
    case 0:
      return `With a satiety score of ${score}/100 and a diet friendliness grade of ${grade}, ${name} serves as a ${verdict} choice for weight management. Because it has ${calories} calories per 100g alongside a macro profile of ${protein}g protein and ${fiber}g fiber, incorporating it into your daily meal planning can help structure your caloric budget while keeping hunger levels stable.`;

    case 1:
      return `${name} scores ${score}/100 on our satiety index, earning a diet friendliness grade of ${grade}. This rating reflects its volume-to-calorie ratio, driven by its nutrient density (${protein}g protein, ${fiber}g fiber, and ${sugar}g sugar per 100g). If you are focusing on calorie-restricted diets, pairing ${name} with high-volume greens is an excellent strategy to maximize fullness.`;

    case 2:
      return `Our analysis assigns ${name} a ${grade} grade for diet friendliness, backed by a satiety rating of ${score}/100. Foods with these values (${calories} kcal/100g) have a ${densityType} glycemic and volume profile. For optimal energy levels and to prevent insulin spikes, try combining it with healthy fats or proteins during your meals.`;

    case 3:
    default:
      return `Evaluating ${name} yields a satiety rating of ${score}/100 and a weight loss grade of ${grade}. Having a balanced diet is about sustainable satiety, and ${name} offers ${protein}g protein and ${fiber}g fiber per 100g. This makes it particularly useful for ${useCase} goals when portion-controlled or paired strategically.`;
  }
}

/**
 * Returns all calculated metrics in a single helper
 */
export function getProprietaryMetrics(f: Food): ProprietaryMetrics {
  const satietyScore = calculateSatietyScore(f);
  const dietGrade = calculateDietGrade(f, satietyScore);
  const commentary = generateProprietaryCommentary(f, satietyScore, dietGrade);

  return { satietyScore, dietGrade, commentary };
}
