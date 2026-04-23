export interface Insight {
  text: string;
  sentiment?: "positive" | "negative" | "neutral";
}

interface FoodData {
  name: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  saturated_fat: number | null;
  cholesterol: number | null;
  potassium: number | null;
  vitamin_c: number | null;
  calcium: number | null;
  iron: number | null;
  category: string | null;
}

export function generateInsights(f: FoodData): Insight[] {
  const insights: Insight[] = [];
  const cal = f.calories ?? 0;
  const prot = f.protein ?? 0;
  const carbs = f.carbs ?? 0;
  const fat = f.fat ?? 0;
  const fiber = f.fiber ?? 0;
  const sugar = f.sugar ?? 0;
  const sodium = f.sodium ?? 0;
  const satFat = f.saturated_fat ?? 0;

  // 1. Calorie density assessment
  if (cal < 50) {
    insights.push({
      text: `${f.name} is very low calorie at ${cal.toFixed(0)} kcal/100g. You can eat generous portions without a major calorie impact, making it ideal for volume eating during weight loss.`,
      sentiment: "positive",
    });
  } else if (cal < 150) {
    insights.push({
      text: `At ${cal.toFixed(0)} kcal/100g, ${f.name} is a low-to-moderate calorie food that fits comfortably into most diet plans.`,
      sentiment: "positive",
    });
  } else if (cal < 300) {
    insights.push({
      text: `${f.name} has ${cal.toFixed(0)} kcal/100g, placing it in the moderate calorie range. Portion awareness is recommended for calorie-controlled diets.`,
      sentiment: "neutral",
    });
  } else {
    insights.push({
      text: `${f.name} is calorie-dense at ${cal.toFixed(0)} kcal/100g. A 100g serving delivers ${Math.round(cal / 20)}% of a 2,000-calorie daily budget. Portion control is key.`,
      sentiment: "negative",
    });
  }

  // 2. Macronutrient balance
  const macroTotal = prot + carbs + fat;
  if (macroTotal > 0) {
    const protPct = Math.round((prot / macroTotal) * 100);
    const carbPct = Math.round((carbs / macroTotal) * 100);
    const fatPct = Math.round((fat / macroTotal) * 100);

    if (prot >= 20) {
      insights.push({
        text: `High protein content: ${prot.toFixed(1)}g per 100g (${protPct}% of macros). Excellent for muscle building, post-workout recovery, and appetite control.`,
        sentiment: "positive",
      });
    } else if (fat >= 30 && satFat >= 10) {
      insights.push({
        text: `Fat-dominant profile (${fatPct}% of macros) with ${satFat.toFixed(1)}g saturated fat. The AHA recommends limiting saturated fat to 13g/day on a 2,000-cal diet.`,
        sentiment: "negative",
      });
    } else if (carbs >= 50 && fiber >= 5) {
      insights.push({
        text: `Carb-rich (${carbPct}% of macros) but with ${fiber.toFixed(1)}g of fiber, which slows digestion and helps stabilize blood sugar. A good complex carb source.`,
        sentiment: "positive",
      });
    } else {
      insights.push({
        text: `Macro split: ${protPct}% protein, ${carbPct}% carbs, ${fatPct}% fat. ${protPct > 30 ? "Protein-forward" : carbPct > 50 ? "Carb-dominant" : "Balanced"} nutritional profile.`,
        sentiment: "neutral",
      });
    }
  }

  // 3. Daily value highlights
  const dvItems: { nutrient: string; amount: number; dv: number; unit: string }[] = [];
  if (fiber > 0) dvItems.push({ nutrient: "fiber", amount: fiber, dv: 28, unit: "g" });
  if (prot > 0) dvItems.push({ nutrient: "protein", amount: prot, dv: 50, unit: "g" });
  if (f.iron && f.iron > 0) dvItems.push({ nutrient: "iron", amount: f.iron, dv: 18, unit: "mg" });
  if (f.calcium && f.calcium > 0) dvItems.push({ nutrient: "calcium", amount: f.calcium, dv: 1300, unit: "mg" });
  if (f.vitamin_c && f.vitamin_c > 0) dvItems.push({ nutrient: "vitamin C", amount: f.vitamin_c, dv: 90, unit: "mg" });

  const highDV = dvItems.filter(d => (d.amount / d.dv) >= 0.2);
  if (highDV.length > 0) {
    const list = highDV.map(d => `${d.nutrient} (${Math.round((d.amount / d.dv) * 100)}% DV)`).join(", ");
    insights.push({
      text: `Notable daily value contributions per 100g: ${list}. These nutrients alone make ${f.name} a meaningful addition to a balanced diet.`,
      sentiment: "positive",
    });
  }

  // 4. Watch-outs
  const concerns: string[] = [];
  if (sugar >= 15) concerns.push(`${sugar.toFixed(1)}g sugar (${Math.round(sugar / 50 * 100)}% of 50g daily limit)`);
  if (sodium >= 400) concerns.push(`${sodium.toFixed(0)}mg sodium (${Math.round(sodium / 2300 * 100)}% of 2,300mg daily limit)`);
  if (satFat >= 5) concerns.push(`${satFat.toFixed(1)}g saturated fat (${Math.round(satFat / 13 * 100)}% of recommended daily max)`);

  if (concerns.length > 0) {
    insights.push({
      text: `Watch out for: ${concerns.join("; ")}. Consider pairing with lower-risk foods to keep daily totals in check.`,
      sentiment: "negative",
    });
  } else {
    insights.push({
      text: `No major nutritional red flags for ${f.name}. Sugar, sodium, and saturated fat levels are all within moderate ranges per 100g.`,
      sentiment: "positive",
    });
  }

  // 5. Healthiness verdict
  const plusPoints = (prot >= 10 ? 1 : 0) + (fiber >= 3 ? 1 : 0) + (cal < 200 ? 1 : 0) + (sugar < 5 ? 1 : 0) + (sodium < 300 ? 1 : 0);
  if (plusPoints >= 4) {
    insights.push({
      text: `Overall, ${f.name} scores well on key health markers (low calorie, solid protein or fiber, low sugar and sodium). A strong everyday food choice.`,
      sentiment: "positive",
    });
  } else if (plusPoints >= 2) {
    insights.push({
      text: `${f.name} has a mixed nutritional profile with some strengths and some areas to watch. Fine in moderation as part of a varied diet.`,
      sentiment: "neutral",
    });
  } else {
    insights.push({
      text: `${f.name} is best consumed in moderation. While it may be enjoyable, it scores low on several key nutritional benchmarks.`,
      sentiment: "negative",
    });
  }

  return insights.slice(0, 5);
}
