/**
 * food-commentary.ts — caloriewize HCU 5-chunk patch (Layer 2 v2).
 *
 * Per-food narrative built from FoodFacts. 12 statuses × 4 narrative slots
 * × 3-4 variants × slug-hash → ~140 distinct strings, deterministic per slug
 * but corpus-wide diverse. Defeats template detection.
 *
 * Pattern source: nameblooms lib/name-commentary.ts.
 *
 * Each FoodCommentary returns:
 *   - headline    — section title, status-inflected
 *   - fact        — FACT paragraph (raw numbers + position in category)
 *   - context     — INTERPRETATION paragraph (peer comparison + signal)
 *   - implication — IMPLICATION paragraph (practical use + swap)
 *
 * Page consumes these as four distinct visual blocks. Avoid cross-paragraph
 * stuffing — each slot has one job.
 */

import type { Food } from './db';
import type { FoodFacts, FoodStatus } from './food-facts';
import {
  pickVariant, ratioPhrase, percentileBand, fmtNutrient, titleCase,
} from './content-helpers';

export interface FoodCommentary {
  headline: string;
  fact: string;
  context: string;
  implication: string;
  status: FoodStatus;
}

// ──────────────────────────────────────────────────────────────────
// Helpers local to commentary (peer phrasing, category label, etc)
// ──────────────────────────────────────────────────────────────────

function categoryLabel(cat: string | null | undefined): string {
  if (!cat) return 'this food group';
  return titleCase(cat).toLowerCase();
}

/** Compose a peer-comparison clause used across many statuses. */
function peerClause(food: Food, facts: FoodFacts): string {
  const cat = facts.catPeerHigher;
  const cross = facts.crossPeer;
  if (cat && food.calories != null) {
    const phrase = ratioPhrase(cat.calories, food.calories, cat.name);
    if (phrase) return `${cat.name} sits ${phrase} for energy density`;
  }
  if (cross && food.calories != null) {
    return `${cross.name} (${cross.calories.toFixed(0)} kcal) lands at a similar calorie load from a different food group`;
  }
  return '';
}

/** Position-in-category clause: "calories rank in the top 10%" etc. */
function calRankClause(facts: FoodFacts): string {
  const p = facts.pct.caloriesPct;
  if (p == null) return '';
  return `Within ${categoryLabel(facts.category)}, this calorie load lands in the ${percentileBand(p)}.`;
}

// ──────────────────────────────────────────────────────────────────
// Status builders — one per FoodStatus
// ──────────────────────────────────────────────────────────────────

function build_high_protein_low_cal(food: Food, facts: FoodFacts): FoodCommentary {
  const slug = food.slug;
  const cal = food.calories ?? 0;
  const protein = food.protein ?? 0;
  const proteinShare = cal > 0 ? Math.round(((protein * 4) / cal) * 100) : 0;

  const headline = pickVariant(slug, [
    `Lean-protein profile: ${protein.toFixed(1)} g per ${cal.toFixed(0)} kcal`,
    `High protein for the calorie cost`,
    `A protein-forward 100 g serving`,
    `Calories light, protein heavy`,
  ], 1);

  const fact = pickVariant(slug, [
    `${food.name} carries ${fmtNutrient(protein, 'g')} of protein in just ${cal.toFixed(0)} kcal per 100 g — roughly ${proteinShare}% of its calories come from protein. ${calRankClause(facts)}`,
    `Per 100 g, ${food.name} delivers ${fmtNutrient(protein, 'g')} of protein at ${cal.toFixed(0)} kcal. Protein supplies about ${proteinShare}% of the energy, well above the share most everyday foods provide. ${calRankClause(facts)}`,
    `In a 100 g portion, ${food.name} provides ${fmtNutrient(protein, 'g')} of protein and ${cal.toFixed(0)} kcal. The protein-to-calorie ratio places it among the leaner choices in its category — about ${proteinShare}% of the calories are protein.`,
  ], 2);

  const context = pickVariant(slug, [
    `Foods with this profile cluster around lean meats, low-fat dairy, egg whites, and certain seafood. ${peerClause(food, facts)}.`,
    `This is the band most dietitians point to for calorie-controlled, protein-prioritised meals. ${peerClause(food, facts)}.`,
    `When researchers map foods on a protein-density curve, items in this zone consistently appear at the top — they let you hit a daily protein target without crowding out other calories. ${peerClause(food, facts)}.`,
  ], 3);

  const implication = pickVariant(slug, [
    `Practically, that means a 100 g portion contributes meaningfully toward a 0.8–1.2 g/kg protein target while leaving room in the day's calorie budget. Pair with a fibre source — vegetables, beans, or whole grains — to round the meal.`,
    `For weight-conscious eaters, that ratio is the win: substantial protein satiety without a steep calorie cost. It slots well into post-workout meals, lunch bowls, or as the protein anchor in a salad.`,
    `If you're tracking macros, this is the kind of food you can portion generously. The trade-off to watch is sodium and saturated fat, which sometimes ride along with high-protein products — check those numbers above before doubling the serving.`,
  ], 4);

  return { headline, fact, context, implication, status: 'high_protein_low_cal' };
}

function build_protein_powerhouse(food: Food, facts: FoodFacts): FoodCommentary {
  const slug = food.slug;
  const protein = food.protein ?? 0;
  const cal = food.calories ?? 0;

  const headline = pickVariant(slug, [
    `Top-decile protein: ${protein.toFixed(1)} g per 100 g`,
    `Protein powerhouse in ${categoryLabel(facts.category)}`,
    `Among the highest-protein options in its group`,
  ], 1);

  const fact = pickVariant(slug, [
    `${food.name} packs ${fmtNutrient(protein, 'g')} of protein per 100 g — landing in the top 10% of ${categoryLabel(facts.category)} for protein content. Total energy is ${cal.toFixed(0)} kcal.`,
    `At ${fmtNutrient(protein, 'g')} per 100 g, ${food.name}'s protein content sits at the upper end of the ${categoryLabel(facts.category)} distribution. The 100 g serving carries ${cal.toFixed(0)} kcal.`,
    `${food.name} delivers ${fmtNutrient(protein, 'g')} protein in 100 g, with ${cal.toFixed(0)} kcal of energy — putting it firmly in the high-protein tail of its category.`,
  ], 2);

  const context = pickVariant(slug, [
    `That density makes it a workhorse for athletes, recovery meals, and anyone hitting elevated protein targets without leaning entirely on supplements. ${peerClause(food, facts)}.`,
    `Foods this protein-dense are often the backbone of high-protein meal plans — they hit the daily target in fewer servings than mid-range options. ${peerClause(food, facts)}.`,
    `Protein at this level shows up most often in concentrated dairy, certain cuts of poultry, and prepared products engineered for the high-protein market. ${peerClause(food, facts)}.`,
  ], 3);

  const implication = pickVariant(slug, [
    `If your goal is 100+ g of protein a day, a 100 g serving here covers a meaningful chunk in one go. Watch the sodium and fat columns — concentrated-protein foods sometimes carry both.`,
    `The practical upside: meet the day's protein floor in fewer portions. The trade-off: at this density, calories from fat or carbs may also be elevated, so the rest of the macro split deserves a glance.`,
    `Stack a serving into a single meal rather than splitting it — protein synthesis benefits from doses ≥20 g, and one portion here clears that bar comfortably.`,
  ], 4);

  return { headline, fact, context, implication, status: 'protein_powerhouse' };
}

function build_fiber_rich(food: Food, facts: FoodFacts): FoodCommentary {
  const slug = food.slug;
  const fiber = food.fiber ?? 0;
  const dvShare = Math.round((fiber / 28) * 100);

  const headline = pickVariant(slug, [
    `Fibre-dense: ${fiber.toFixed(1)} g per 100 g`,
    `${dvShare}% of the daily fibre target in 100 g`,
    `A fibre-forward option`,
  ], 1);

  const fact = pickVariant(slug, [
    `${food.name} provides ${fmtNutrient(fiber, 'g')} of fibre per 100 g — about ${dvShare}% of the 28 g daily reference. That places it in the top fibre band for ${categoryLabel(facts.category)}.`,
    `A 100 g serving of ${food.name} contributes ${fmtNutrient(fiber, 'g')} fibre, roughly ${dvShare}% of the 28 g daily value. Few foods reach this density without being explicitly fibre-fortified.`,
    `Per 100 g, ${food.name} carries ${fmtNutrient(fiber, 'g')} of fibre. The FDA classifies any food at ≥5 g/100 g as a "good source" — this clears that bar.`,
  ], 2);

  const context = pickVariant(slug, [
    `Most adults fall short of the 28 g daily target by a wide margin; foods like this close the gap quickly. ${peerClause(food, facts)}.`,
    `Fibre at this level supports satiety, blood-sugar response, and gut microbiome diversity — all backed by consistent evidence. ${peerClause(food, facts)}.`,
    `In the typical Western diet, fibre intake averages 15 g/day; foods clearing 6 g/100 g can cover a third of the gap in a single serving. ${peerClause(food, facts)}.`,
  ], 3);

  const implication = pickVariant(slug, [
    `Build it into one meal a day — breakfast or lunch — and pair with adequate water. Sudden jumps in fibre can cause bloating; ramp up over a week if you're not used to high-fibre meals.`,
    `If you're tracking blood sugar or working on satiety for weight management, this is a reliable anchor food. The fibre slows glucose absorption and stretches the calories across a longer window of fullness.`,
    `Two 100 g servings cover roughly half the day's fibre target — useful when you're aiming for the 28 g goal but don't want to over-engineer every meal.`,
  ], 4);

  return { headline, fact, context, implication, status: 'fiber_rich' };
}

function build_vitamin_c_powerhouse(food: Food, facts: FoodFacts): FoodCommentary {
  const slug = food.slug;
  const vc = food.vitamin_c ?? 0;
  const dvShare = Math.round((vc / 90) * 100);

  const headline = pickVariant(slug, [
    `Vitamin C dense: ${vc.toFixed(1)} mg per 100 g`,
    `${dvShare}% of the daily vitamin C target in one 100 g serving`,
    `A vitamin C powerhouse`,
  ], 1);

  const fact = pickVariant(slug, [
    `${food.name} delivers ${vc.toFixed(1)} mg of vitamin C per 100 g — about ${dvShare}% of the 90 mg daily reference. The FDA's "excellent source" threshold is 18 mg/100 g; this clears it comfortably.`,
    `A 100 g portion of ${food.name} supplies ${vc.toFixed(1)} mg vitamin C, roughly ${dvShare}% of the 90 mg DV. Foods at this density are concentrated in citrus, some peppers, and select tropical fruits.`,
    `${food.name} carries ${vc.toFixed(1)} mg of vitamin C in 100 g — enough that a single serving can cover a sizeable share of the day's needs.`,
  ], 2);

  const context = pickVariant(slug, [
    `Vitamin C is water-soluble and not stored in meaningful amounts, so daily intake matters more than mega-doses. Foods at this density let you hit the 90 mg target without supplementation. ${peerClause(food, facts)}.`,
    `Beyond immune support, vitamin C is a cofactor for collagen synthesis and improves non-heme iron absorption when eaten with plant proteins. ${peerClause(food, facts)}.`,
    `Most fortified juices and supplements deliver vitamin C, but whole foods at this density also bring fibre, polyphenols, and other co-factors that supplements can't replicate. ${peerClause(food, facts)}.`,
  ], 3);

  const implication = pickVariant(slug, [
    `Practical move: pair with iron-rich plants (lentils, spinach) at the same meal — the vitamin C boosts non-heme iron uptake by 2–3×. Heat and prolonged storage degrade vitamin C, so fresher is better.`,
    `One 100 g serving alongside a meal covers most adults' daily target. If you smoke or are post-illness, the requirement nudges higher (~125 mg), so a second portion isn't wasted.`,
    `Don't over-cook it. Boiling and long oven times cut vitamin C by 30–50%; raw, lightly steamed, or briefly stir-fried preserves the most.`,
  ], 4);

  return { headline, fact, context, implication, status: 'vitamin_c_powerhouse' };
}

function build_mineral_rich(food: Food, facts: FoodFacts): FoodCommentary {
  const slug = food.slug;
  const k = food.potassium ?? 0;
  const ca = food.calcium ?? 0;
  const fe = food.iron ?? 0;
  const stars: string[] = [];
  if (k >= 350) stars.push(`${k.toFixed(0)} mg potassium`);
  if (ca >= 100) stars.push(`${ca.toFixed(0)} mg calcium`);
  if (fe >= 2) stars.push(`${fe.toFixed(1)} mg iron`);
  const list = stars.join(', ') || 'multiple minerals';

  const headline = pickVariant(slug, [
    `Mineral profile: ${list}`,
    `Top-decile mineral density`,
    `A mineral-rich option per 100 g`,
  ], 1);

  const fact = pickVariant(slug, [
    `${food.name} contributes ${list} per 100 g — placing it in the top mineral band for ${categoryLabel(facts.category)}. Few foods deliver this combination without fortification.`,
    `A 100 g serving of ${food.name} carries ${list}. That puts it in the top decile of its category for at least one mineral.`,
    `Per 100 g, ${food.name} provides ${list}. These are minerals most adults under-consume relative to the daily reference.`,
  ], 2);

  const context = pickVariant(slug, [
    `The classic mineral shortfalls in Western diets are potassium, calcium, and iron — foods at this density close those gaps faster than fortified alternatives. ${peerClause(food, facts)}.`,
    `Mineral-rich whole foods carry their nutrients alongside fibre, protein, or healthy fats — a profile supplements rarely match. ${peerClause(food, facts)}.`,
    `Bone density, blood pressure regulation, and oxygen transport all hinge on the minerals listed above. Hitting the daily target is easier with foods like this in rotation. ${peerClause(food, facts)}.`,
  ], 3);

  const implication = pickVariant(slug, [
    `Slot it into 2–3 meals a week to hit cumulative mineral targets without leaning on multivitamins. Iron absorbs better with vitamin C; calcium absorbs better when split across the day rather than dosed once.`,
    `If you've had a recent blood panel showing low iron, ferritin, or potassium, foods at this density move the needle in 2–4 weeks of consistent intake — supplements work faster but with more side effects.`,
    `Pair the iron with a vitamin-C source at the same sitting; pair the calcium with vitamin D (sun, salmon, eggs) to support absorption.`,
  ], 4);

  return { headline, fact, context, implication, status: 'mineral_rich' };
}

function build_balanced_macro(food: Food, facts: FoodFacts): FoodCommentary {
  const slug = food.slug;
  const split = facts.macroSplit;
  const cal = food.calories ?? 0;
  const splitStr = split
    ? `${Math.round(split.proteinPct * 100)}% protein / ${Math.round(split.carbPct * 100)}% carbs / ${Math.round(split.fatPct * 100)}% fat`
    : 'an even macro split';

  const headline = pickVariant(slug, [
    `Balanced macro split: ${splitStr}`,
    `Even split across protein, carbs, and fat`,
    `Macro-balanced 100 g serving`,
  ], 1);

  const fact = pickVariant(slug, [
    `${food.name} comes in at ${cal.toFixed(0)} kcal per 100 g with calories spread roughly ${splitStr}. No single macro dominates the energy load.`,
    `A 100 g serving of ${food.name} provides ${cal.toFixed(0)} kcal with a ${splitStr} breakdown — a profile typical of mixed dishes, balanced bowls, and certain dairy products.`,
    `${food.name} sits in the macro-neutral zone: ${splitStr} of its ${cal.toFixed(0)} kcal. None of the three macros falls below 20% of energy.`,
  ], 2);

  const context = pickVariant(slug, [
    `Balanced foods slot easily into any pattern — keto-leaning, plant-forward, or standard mixed — without overshooting one macro. ${peerClause(food, facts)}.`,
    `When meal planning, foods in this band act as low-friction defaults: they don't need to be paired with a specific macro counterweight to round out a meal. ${peerClause(food, facts)}.`,
    `The "satisfying meal" research consistently points to balanced macro inputs for sustained satiety; foods like this make hitting that profile easier. ${peerClause(food, facts)}.`,
  ], 3);

  const implication = pickVariant(slug, [
    `Use it as the foundation of a meal and add one targeted accent — extra greens for fibre, a citrus for vitamin C, or a protein bump if you're training hard.`,
    `Balanced macros mean balanced satiety: this food won't spike then crash blood sugar the way a carb-heavy item might, and it won't sit as heavy as a fat-dominant one. Useful in mid-day meals where energy stability matters.`,
    `If you're new to macro tracking, anchoring meals around balanced foods like this lowers the cognitive load — the macro split takes care of itself.`,
  ], 4);

  return { headline, fact, context, implication, status: 'balanced_macro' };
}

function build_calorie_dense_indulgent(food: Food, facts: FoodFacts): FoodCommentary {
  const slug = food.slug;
  const cal = food.calories ?? 0;
  const fat = food.fat ?? 0;
  const sugar = food.sugar ?? 0;

  const headline = pickVariant(slug, [
    `Calorie-dense: ${cal.toFixed(0)} kcal per 100 g`,
    `An indulgent 100 g portion`,
    `Energy-dense — pace the portion`,
  ], 1);

  const fact = pickVariant(slug, [
    `${food.name} delivers ${cal.toFixed(0)} kcal per 100 g with ${fmtNutrient(fat, 'g')} fat and ${fmtNutrient(sugar, 'g')} sugar. Protein is below 8 g/100 g — the calorie load is driven by fat, sugar, or both. ${calRankClause(facts)}`,
    `Per 100 g, ${food.name} carries ${cal.toFixed(0)} kcal — most of it from ${fmtNutrient(fat, 'g')} fat and ${fmtNutrient(sugar, 'g')} sugar rather than protein. ${calRankClause(facts)}`,
    `${food.name} sits in the calorie-dense zone: ${cal.toFixed(0)} kcal in a 100 g serving, with the energy concentrated in fat (${fmtNutrient(fat, 'g')}) and sugar (${fmtNutrient(sugar, 'g')}).`,
  ], 2);

  const context = pickVariant(slug, [
    `Foods at this density show up most often in baked goods, fried items, and concentrated fats. They aren't "bad" — they're high-information per 100 g, which means portion size carries weight. ${peerClause(food, facts)}.`,
    `For a 2,000 kcal day, a 100 g serving uses ${facts.servingsToDay ? Math.round((100 / facts.servingsToDay) * 100) / 100 : ''} of the daily budget — a quarter to a third in many cases. That's not unreasonable, but it's worth eyeballing the rest of the day. ${peerClause(food, facts)}.`,
    `The concern with energy-dense, low-protein foods is that they don't trigger satiety in proportion to their calorie load — you can over-consume before feeling full. ${peerClause(food, facts)}.`,
  ], 3);

  const implication = pickVariant(slug, [
    `Easiest swap: cut the portion in half and pair with something high in protein or fibre to even out satiety. A 50 g serving still delivers most of the flavour at half the calorie cost.`,
    `Treat it as a feature of a meal rather than a backbone. Pair with greens, lean protein, or fibre to slow absorption and balance the macro picture.`,
    `If you're tracking, weighing the portion (rather than eyeballing) matters more here than with low-density foods — small visual under-estimates compound quickly at this calorie density.`,
  ], 4);

  return { headline, fact, context, implication, status: 'calorie_dense_indulgent' };
}

function build_sodium_heavy(food: Food, facts: FoodFacts): FoodCommentary {
  const slug = food.slug;
  const sodium = food.sodium ?? 0;
  const dvShare = Math.round((sodium / 2300) * 100);

  const headline = pickVariant(slug, [
    `Sodium-heavy: ${sodium.toFixed(0)} mg per 100 g`,
    `${dvShare}% of the daily sodium cap in 100 g`,
    `Sodium is the macro to watch here`,
  ], 1);

  const fact = pickVariant(slug, [
    `${food.name} carries ${sodium.toFixed(0)} mg of sodium per 100 g — about ${dvShare}% of the 2,300 mg daily upper limit. The AHA's stricter target of 1,500 mg is reached even faster.`,
    `Per 100 g, ${food.name} provides ${sodium.toFixed(0)} mg sodium, roughly ${dvShare}% of the FDA's 2,300 mg DV. That's "high-sodium" by FDA labelling thresholds.`,
    `${food.name} delivers ${sodium.toFixed(0)} mg sodium in a 100 g portion — enough that two servings put most adults near or above the daily ceiling.`,
  ], 2);

  const context = pickVariant(slug, [
    `About 90% of US adults exceed the recommended sodium intake; processed and prepared foods drive most of that excess. ${peerClause(food, facts)}.`,
    `Sodium's link to blood pressure is clearest in salt-sensitive individuals — roughly half the population. For everyone else, the practical impact is modest, but the FDA cap exists for population-level reasons. ${peerClause(food, facts)}.`,
    `Foods at this sodium density typically include processed meats, canned vegetables, sauces, and many restaurant or convenience items. ${peerClause(food, facts)}.`,
  ], 3);

  const implication = pickVariant(slug, [
    `If you're managing blood pressure or have been told to cut sodium, this is one to portion carefully or rotate out. Pair with potassium-rich foods (bananas, leafy greens, beans) to offset.`,
    `Practical guideline: keep the rest of the day's meals low-sodium when this is on the plate. A single serving doesn't break the budget, but stacking multiple high-sodium items easily does.`,
    `Rinsing canned versions can drop sodium 20–40%; choosing low-sodium alternatives or unsalted variants makes a bigger dent in long-term intake than occasional restraint.`,
  ], 4);

  return { headline, fact, context, implication, status: 'sodium_heavy' };
}

function build_sugar_heavy(food: Food, facts: FoodFacts): FoodCommentary {
  const slug = food.slug;
  const sugar = food.sugar ?? 0;
  const dvShare = Math.round((sugar / 50) * 100);

  const headline = pickVariant(slug, [
    `Sugar-heavy: ${sugar.toFixed(1)} g per 100 g`,
    `${dvShare}% of the daily added-sugar reference in 100 g`,
    `Sugar drives the calorie load here`,
  ], 1);

  const fact = pickVariant(slug, [
    `${food.name} contains ${fmtNutrient(sugar, 'g')} of sugars per 100 g — about ${dvShare}% of the 50 g daily reference. That includes naturally occurring and added sugars; check the label for the split.`,
    `A 100 g serving of ${food.name} provides ${fmtNutrient(sugar, 'g')} of total sugars, roughly ${dvShare}% of the 50 g DV. By FDA standards, ≥10 g/100 g is "high".`,
    `Per 100 g, ${food.name} delivers ${fmtNutrient(sugar, 'g')} sugars — at this concentration, sugar contributes most of the calorie load.`,
  ], 2);

  const context = pickVariant(slug, [
    `The current US dietary guideline caps added sugars at <10% of energy — about 50 g for a 2,000 kcal day. The WHO's stricter target is 5%. Foods at this density push that limit in a single serving. ${peerClause(food, facts)}.`,
    `Whether the sugar is "natural" (fruit, dairy) or "added" (sweeteners) matters for context — natural sources usually come bundled with fibre and micronutrients that blunt the glycemic response. ${peerClause(food, facts)}.`,
    `High-sugar foods are not automatically problematic, but they crowd out other foods if eaten frequently. The calorie-per-bite is high relative to the satiety they deliver. ${peerClause(food, facts)}.`,
  ], 3);

  const implication = pickVariant(slug, [
    `Pair with protein or fat to slow absorption — that flattens the glucose curve and lengthens satiety. Eating it after a meal hits the bloodstream more gently than on an empty stomach.`,
    `If you're tracking glucose or managing weight, this is a watch-and-portion food rather than an avoid food. A 50 g serving rather than 100 g halves the impact while keeping most of the experience.`,
    `Read the ingredient list: if sugar (or syrups, juices, malt extract) appears in the top three ingredients, the sugar here is mostly added rather than intrinsic.`,
  ], 4);

  return { headline, fact, context, implication, status: 'sugar_heavy' };
}

function build_sat_fat_heavy(food: Food, facts: FoodFacts): FoodCommentary {
  const slug = food.slug;
  const sf = food.saturated_fat ?? 0;
  const dvShare = Math.round((sf / 20) * 100);

  const headline = pickVariant(slug, [
    `Saturated-fat heavy: ${sf.toFixed(1)} g per 100 g`,
    `${dvShare}% of the daily saturated-fat cap in 100 g`,
    `Saturated fat is the macro to mind`,
  ], 1);

  const fact = pickVariant(slug, [
    `${food.name} carries ${fmtNutrient(sf, 'g')} of saturated fat per 100 g — about ${dvShare}% of the 20 g daily upper limit. That's "high" by FDA labelling.`,
    `Per 100 g, ${food.name} delivers ${fmtNutrient(sf, 'g')} saturated fat, ${dvShare}% of the 20 g DV. Two servings cover most of the day's saturated-fat budget.`,
    `A 100 g portion of ${food.name} contributes ${fmtNutrient(sf, 'g')} saturated fat — enough that a single serving uses a meaningful share of the daily allowance.`,
  ], 2);

  const context = pickVariant(slug, [
    `Saturated-fat guidelines target <10% of energy for general health, lower for those with elevated LDL or cardiovascular risk. Foods at this density use that quota quickly. ${peerClause(food, facts)}.`,
    `Recent research has nuanced the saturated-fat story — the source matters (dairy fat ≠ processed meat fat), and total dietary pattern often outweighs single-nutrient focus. The cap remains, but context matters. ${peerClause(food, facts)}.`,
    `Foods this dense in saturated fat tend to come from animal products, tropical oils, or baked goods. The calorie load alongside the saturated fat is typically high too. ${peerClause(food, facts)}.`,
  ], 3);

  const implication = pickVariant(slug, [
    `If LDL or cardiovascular concerns are on your radar, portion-control this and offset with unsaturated-fat sources elsewhere in the day — olive oil, nuts, fish.`,
    `For most adults without specific risk factors, occasional servings sit comfortably within healthy patterns. The issue is frequency: daily inclusion compounds quickly.`,
    `Swapping half the portion for a leaner alternative (or adding fibre/vegetables alongside) preserves the experience while loosening the saturated-fat hit.`,
  ], 4);

  return { headline, fact, context, implication, status: 'sat_fat_heavy' };
}

function build_ultra_low_cal(food: Food, facts: FoodFacts): FoodCommentary {
  const slug = food.slug;
  const cal = food.calories ?? 0;
  const water = 100 - ((food.protein ?? 0) + (food.fat ?? 0) + (food.carbs ?? 0));

  const headline = pickVariant(slug, [
    `Ultra-low-cal: ${cal.toFixed(0)} kcal per 100 g`,
    `A water-rich, low-calorie food`,
    `Volume eating without the calorie cost`,
  ], 1);

  const fact = pickVariant(slug, [
    `${food.name} provides just ${cal.toFixed(0)} kcal per 100 g — among the lowest energy densities in the food supply. Most of the weight is water (~${Math.max(80, Math.round(water))} g), which is why the calorie count stays low.`,
    `A 100 g serving of ${food.name} carries only ${cal.toFixed(0)} kcal. Water content dominates the mass, leaving very little room for energy-bearing macros.`,
    `${food.name} sits at ${cal.toFixed(0)} kcal per 100 g — well below the 100 kcal/100 g threshold many dietitians use to define "low energy density".`,
  ], 2);

  const context = pickVariant(slug, [
    `Ultra-low-cal foods (lettuces, cucumbers, summer squash, broths) anchor "volume eating" approaches — large portions with minimal calorie cost. ${peerClause(food, facts)}.`,
    `Energy-density research consistently links low-density foods to lower overall calorie intake without conscious restriction — they fill the stomach for fewer calories. ${peerClause(food, facts)}.`,
    `These are the foods most weight-management programs encourage eating freely; the calorie-per-bite ratio is low enough that portion size rarely matters. ${peerClause(food, facts)}.`,
  ], 3);

  const implication = pickVariant(slug, [
    `Use it as a stretcher — bulk up bowls, salads, or stir-fries to add volume without adding calories. The fibre and water also slow gastric emptying, prolonging fullness.`,
    `Two or three 100 g servings cost less than 100 kcal — a useful tool for hitting fibre and micronutrient targets without using up calorie budget.`,
    `Eating before higher-calorie components of a meal can blunt total intake; the volume reaches the stomach first and triggers satiety signals before the dense food arrives.`,
  ], 4);

  return { headline, fact, context, implication, status: 'ultra_low_cal' };
}

function build_everyday_moderate(food: Food, facts: FoodFacts): FoodCommentary {
  const slug = food.slug;
  const cal = food.calories ?? 0;
  const protein = food.protein ?? 0;
  const carbs = food.carbs ?? 0;
  const fat = food.fat ?? 0;

  const headline = pickVariant(slug, [
    `Everyday profile: ${cal.toFixed(0)} kcal per 100 g`,
    `A mid-range nutrient profile`,
    `Sits in the middle of its category`,
  ], 1);

  const fact = pickVariant(slug, [
    `${food.name} delivers ${cal.toFixed(0)} kcal per 100 g with ${fmtNutrient(protein, 'g')} protein, ${fmtNutrient(carbs, 'g')} carbs, and ${fmtNutrient(fat, 'g')} fat. ${calRankClause(facts)}`,
    `A 100 g portion of ${food.name} carries ${cal.toFixed(0)} kcal — protein ${fmtNutrient(protein, 'g')}, carbs ${fmtNutrient(carbs, 'g')}, fat ${fmtNutrient(fat, 'g')}. None of the macros lands at an extreme. ${calRankClause(facts)}`,
    `Per 100 g, ${food.name} provides ${cal.toFixed(0)} kcal across ${fmtNutrient(protein, 'g')} protein, ${fmtNutrient(carbs, 'g')} carbs, and ${fmtNutrient(fat, 'g')} fat — a profile typical of mid-range foods in ${categoryLabel(facts.category)}.`,
  ], 2);

  const context = pickVariant(slug, [
    `Foods in this band don't dominate any single macro target, but they don't conflict with most dietary patterns either. ${peerClause(food, facts)}.`,
    `Most everyday meals are built from foods like this — the workhorses, not the headliners. They flex into a wide variety of dishes without forcing macro accommodations. ${peerClause(food, facts)}.`,
    `When dietitians talk about "balanced eating", foods at this profile are the kind they mean — neither restrictive nor indulgent, just consistent. ${peerClause(food, facts)}.`,
  ], 3);

  const implication = pickVariant(slug, [
    `Use it freely. The macro profile won't push you toward any extreme, so it pairs well with whatever else is on the plate.`,
    `If you're targeting a specific macro (more protein, less fat), this food alone won't move the needle either way — adjust the accent ingredients instead.`,
    `Practical move: keep it in regular rotation as a base, and use higher-protein or higher-fibre additions to hit specific targets when needed.`,
  ], 4);

  return { headline, fact, context, implication, status: 'everyday_moderate' };
}

// ──────────────────────────────────────────────────────────────────
// Public dispatch
// ──────────────────────────────────────────────────────────────────

export function getFoodCommentary(food: Food, facts: FoodFacts): FoodCommentary {
  switch (facts.status) {
    case 'high_protein_low_cal':    return build_high_protein_low_cal(food, facts);
    case 'protein_powerhouse':      return build_protein_powerhouse(food, facts);
    case 'fiber_rich':              return build_fiber_rich(food, facts);
    case 'vitamin_c_powerhouse':    return build_vitamin_c_powerhouse(food, facts);
    case 'mineral_rich':            return build_mineral_rich(food, facts);
    case 'balanced_macro':          return build_balanced_macro(food, facts);
    case 'calorie_dense_indulgent': return build_calorie_dense_indulgent(food, facts);
    case 'sodium_heavy':            return build_sodium_heavy(food, facts);
    case 'sugar_heavy':             return build_sugar_heavy(food, facts);
    case 'sat_fat_heavy':           return build_sat_fat_heavy(food, facts);
    case 'ultra_low_cal':           return build_ultra_low_cal(food, facts);
    case 'everyday_moderate':       return build_everyday_moderate(food, facts);
  }
}
