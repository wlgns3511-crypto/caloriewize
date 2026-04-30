/**
 * food-cluster-insights.ts — caloriewize HCU 5-chunk patch (Layer 2 for hubs).
 *
 * Narrative blocks for /category/, /list/, /state/ pages. Pattern source:
 * nameblooms lib/cluster-insights.ts.
 *
 * Each builder:
 *   1. Pulls aggregate stats for the cluster (already SQL-backed by db.ts).
 *   2. Picks 3 narrative paragraphs via slug-hash from a 4-variant pool.
 *   3. Returns a clean array of strings the page renders verbatim.
 *
 * No client-side variation — pure SSG. Page key is the slug for /category/
 * and /list/, the state slug for /state/.
 */

import type { Food } from './db';
import {
  pickVariant, fmtCount, ratioPhrase, titleCase, fmtNutrient,
} from './content-helpers';

// ──────────────────────────────────────────────────────────────────
// /category/[slug]/  Layer 2
// ──────────────────────────────────────────────────────────────────

export interface CategoryInsight {
  intro: string;
  distribution: string;
  practicalUse: string;
}

export function getCategoryInsight(catSlug: string, catName: string, foods: Food[]): CategoryInsight {
  const n = foods.length;
  const withCal = foods.filter((f) => f.calories != null && f.calories > 0);
  const meanCal = withCal.length
    ? withCal.reduce((s, f) => s + (f.calories ?? 0), 0) / withCal.length
    : 0;
  const sortedCal = withCal.map((f) => f.calories!).sort((a, b) => a - b);
  const medianCal = sortedCal[Math.floor(sortedCal.length / 2)] ?? 0;
  const minCal = sortedCal[0] ?? 0;
  const maxCal = sortedCal[sortedCal.length - 1] ?? 0;
  const minFood = withCal.find((f) => f.calories === minCal);
  const maxFood = withCal.find((f) => f.calories === maxCal);

  const meanProtein =
    foods.filter((f) => f.protein != null).reduce((s, f) => s + (f.protein ?? 0), 0) /
    Math.max(1, foods.filter((f) => f.protein != null).length);
  const meanFiber =
    foods.filter((f) => f.fiber != null).reduce((s, f) => s + (f.fiber ?? 0), 0) /
    Math.max(1, foods.filter((f) => f.fiber != null).length);

  const intro = pickVariant(catSlug, [
    `${catName} covers ${fmtCount(n)} entries in this database, drawn from USDA FoodData Central. The category clusters foods that share preparation, source, or culinary use — not just nutrient profile, so calorie loads inside the group span a wide range.`,
    `This database tracks ${fmtCount(n)} ${catName.toLowerCase()} items, each with full macro and micronutrient detail per 100 g. Because the grouping is structural rather than nutritional, foods inside the category vary substantially on calories, fat, sugar, and sodium.`,
    `${catName} is grouped by USDA classification and contains ${fmtCount(n)} items here. Within that umbrella, individual foods differ by orders of magnitude on energy density — so the category as a whole isn't a useful proxy for a single nutritional pattern.`,
    `${fmtCount(n)} foods sit under the ${catName.toLowerCase()} label in this dataset. Treating the group as a single nutritional category masks real variation; the per-100 g spread on calories alone is wide.`,
  ], 1);

  const distribution = pickVariant(catSlug, [
    `Calorie content ranges from ${minCal.toFixed(0)} kcal/100 g (${minFood?.name ?? 'lowest'}) to ${maxCal.toFixed(0)} kcal/100 g (${maxFood?.name ?? 'highest'}). The median sits at ${medianCal.toFixed(0)} kcal/100 g, with a mean of ${meanCal.toFixed(0)} kcal — protein averages ${meanProtein.toFixed(1)} g, fibre ${meanFiber.toFixed(1)} g.`,
    `Per 100 g, the lightest entry is ${minFood?.name ?? '—'} at ${minCal.toFixed(0)} kcal; the densest is ${maxFood?.name ?? '—'} at ${maxCal.toFixed(0)} kcal. Across the category, mean calories are ${meanCal.toFixed(0)} kcal/100 g and median ${medianCal.toFixed(0)} kcal — a span of ${(maxCal - minCal).toFixed(0)} kcal between the extremes.`,
    `The category's calorie distribution stretches from ${minCal.toFixed(0)} kcal to ${maxCal.toFixed(0)} kcal per 100 g (median ${medianCal.toFixed(0)}, mean ${meanCal.toFixed(0)}). Average protein lands at ${meanProtein.toFixed(1)} g/100 g and fibre at ${meanFiber.toFixed(1)} g.`,
  ], 2);

  const practicalUse = pickVariant(catSlug, [
    `For meal planning, treat the category as a starting filter rather than an answer. Pick the specific item, then check its calorie, protein, and sodium columns — that's where the meaningful differences sit.`,
    `If you're calorie-tracking, pick by individual item rather than by category — the spread is too wide to use a single representative number. Many ${catName.toLowerCase()} items work in calorie-controlled patterns; a few don't.`,
    `Use the items below as a comparison set: when one ${catName.toLowerCase()} entry is dense, an alternative inside the same category often delivers a similar role at half the calorie or sodium load.`,
    `The list below is sorted alphabetically; for nutrition-led picks, sort mentally by the calorie or protein columns once you scan a few rows. Patterns inside ${catName.toLowerCase()} emerge fast.`,
  ], 3);

  return { intro, distribution, practicalUse };
}

// ──────────────────────────────────────────────────────────────────
// /list/[type]/  Layer 2
// ──────────────────────────────────────────────────────────────────

export type ListType =
  | 'low-calorie'
  | 'high-protein'
  | 'high-fiber'
  | 'low-sodium'
  | 'low-sugar'
  | 'low-fat'
  | 'low-carb'
  | 'high-vitamin-c'
  | 'high-calcium'
  | 'high-iron'
  | 'high-potassium'
  | 'low-cholesterol'
  | 'low-saturated-fat'
  | 'ultra-low-calorie'
  | 'high-protein-low-calorie';

export interface ListMeta {
  type: ListType;
  title: string;
  subtitle: string;
  intro: string;
  context: string;
  caveats: string;
}

const LIST_PROFILES: Record<ListType, { title: string; subtitle: string; introVariants: string[]; contextVariants: string[]; caveatVariants: string[] }> = {
  'low-calorie': {
    title: 'Low-calorie foods',
    subtitle: 'Lowest energy density per 100 g',
    introVariants: [
      'Low-calorie foods (under ~50 kcal/100 g) anchor "volume eating" approaches: large portions, minimal calorie cost. Most are water-rich vegetables, fruits, and broths — the calorie load stays low because water dominates the mass.',
      'These are the foods that fill the plate without filling the calorie budget. Energy density below ~50 kcal/100 g lets servings stay generous while total intake stays controlled.',
      'When dietitians talk about foods you can eat freely, this is usually the band they mean. The combination of fibre, water, and minimal energy density makes them satiety-positive at low cost.',
    ],
    contextVariants: [
      'Energy-density research consistently links low-density foods to lower overall calorie intake without conscious restriction — eating to fullness yields fewer calories per meal.',
      'For weight management, swapping mid-density foods for low-density ones is one of the few interventions with strong evidence for sustained calorie reduction without explicit tracking.',
      'Low-calorie foods also tend to carry potassium, magnesium, and vitamin C — micronutrients many adults under-consume. The double benefit makes them disproportionately valuable per 100 g.',
    ],
    caveatVariants: [
      'A few items on this list are very low-cal because they\'re largely water (cucumbers, lettuces). They\'re fine fillers, but pair with a protein and fat source — a meal made entirely of ultra-low-cal foods leaves macros incomplete.',
      'Watch portion-of-portion: low-cal-per-100 g doesn\'t mean low-cal-per-typical-serving for everything (some sauces qualify on the 100 g basis but you\'d never eat 100 g).',
      'Cooking method matters: dressings, oils, and butter quickly transform a 20 kcal/100 g vegetable into a 200 kcal/100 g side. The raw or steamed numbers below are the floor, not the ceiling.',
    ],
  },
  'high-protein': {
    title: 'High-protein foods',
    subtitle: 'Top protein density per 100 g',
    introVariants: [
      'High-protein foods (≥18 g/100 g) cover the foods athletes, dieters, and high-protein-pattern eaters rely on. Lean meats, fish, certain dairy, and select plant proteins dominate the list.',
      'When the goal is to hit 100+ g of protein a day, foods on this list do the heavy lifting. Density above ~18 g/100 g means a single serving covers a meaningful share of the daily target.',
      'These are the foods most often used as the "protein anchor" of a meal — the item the rest of the plate is built around.',
    ],
    contextVariants: [
      'Protein supports satiety, lean mass retention during calorie deficits, and recovery after training. Spreading intake across 3–4 meals (≥20 g per dose) is more effective for synthesis than back-loading the day.',
      'Animal proteins generally score higher on amino-acid completeness; plant proteins often need pairing (rice + beans, soy + grain) to match the profile. The list below mixes both — note the source for the trade-off.',
      'For older adults, protein needs nudge upward (~1.2 g/kg) to support muscle retention. Foods at this density make the higher target reachable without dramatic portion increases.',
    ],
    caveatVariants: [
      'High-protein foods sometimes carry high sodium or saturated fat alongside (deli meats, cheeses, processed proteins). Check those columns before doubling the serving.',
      'Protein-fortified products (bars, shakes, "high-protein" yogurts) often appear here, but they\'re not always nutritionally equivalent to whole-food sources. Treat fortification as a tool, not a substitute.',
      'Cooking method affects the per-100 g figure: dry-cooked meat concentrates protein vs raw, while breading or sauces dilute it. The numbers below assume the standard preparation in the USDA dataset.',
    ],
  },
  'high-fiber': {
    title: 'High-fibre foods',
    subtitle: 'Top fibre density per 100 g',
    introVariants: [
      'Fibre-dense foods (≥6 g/100 g) close the gap between typical intake (~15 g/day) and the 28 g daily reference. Beans, whole grains, certain fruits, and leafy vegetables dominate.',
      'These are the foods that move the needle on fibre intake fastest — a single 100 g serving covers a fifth to a third of the daily target.',
      'Fibre at this density supports satiety, blood-sugar response, and gut microbiome diversity. The evidence base is unusually consistent across dietary patterns.',
    ],
    contextVariants: [
      'Most adults fall short of the 28 g daily fibre target by a wide margin. Foods like these turn that gap from "needs reform" to "manageable" without dramatic dietary changes.',
      'Soluble vs insoluble fibre both matter, and most high-fibre whole foods carry a mix. The labels below report total fibre — which is what matters for daily target tracking.',
      'High-fibre foods double as nutrient-dense foods: they typically carry potassium, magnesium, and B vitamins alongside the fibre. The bundle is hard to replicate with supplements.',
    ],
    caveatVariants: [
      'Sudden jumps in fibre cause bloating and gas — ramp up over a week or two if you\'re not used to high-fibre meals. Adequate water intake matters more as fibre rises.',
      'Some high-fibre processed foods carry high sugar or sodium too (sweetened oat-based products, certain crackers). Whole-food sources are cleaner profiles overall.',
      'For people managing IBS or specific GI conditions, high-fibre foods aren\'t universally helpful — a low-FODMAP or selective approach often works better. Standard guidelines don\'t always apply.',
    ],
  },
  'low-sodium': {
    title: 'Low-sodium foods',
    subtitle: 'Sodium ≤ 100 mg per 100 g',
    introVariants: [
      'Low-sodium foods (≤100 mg/100 g) are the natural defaults: fresh vegetables, fruits, unprocessed grains, and unsalted nuts and meats. Anything that hasn\'t been processed, brined, or cured.',
      'For anyone managing blood pressure or cutting sodium, building meals from this list keeps total intake well under the 2,300 mg daily cap without portion control acrobatics.',
      'These are the foods that sit naturally below the FDA\'s low-sodium label threshold (≤140 mg/serving). No sodium reduction effort needed — they\'re already there.',
    ],
    contextVariants: [
      'About 90% of US adults exceed the recommended sodium intake. Most of the excess comes from processed and prepared foods, not from the salt shaker. Building meals around foods like these reverses the math.',
      'Sodium\'s blood-pressure link is clearest in salt-sensitive individuals (~half the population). For everyone else, the population-level cap exists for cardiovascular reasons, but individual benefit varies.',
      'Pairing low-sodium foods with potassium-rich items (bananas, potatoes, beans) further supports blood pressure regulation. The two minerals act as counterweights.',
    ],
    caveatVariants: [
      'Just because a food is low-sodium per 100 g doesn\'t mean preparation keeps it that way. Salting during cooking or table-side easily adds 200–500 mg per serving.',
      'Some low-sodium products are reformulated with potassium chloride, which most people tolerate well but those with kidney conditions should monitor.',
      'Restaurant versions of any food on this list are likely much higher in sodium than the raw figure suggests. Home preparation preserves the low-sodium status.',
    ],
  },
  'low-sugar': {
    title: 'Low-sugar foods',
    subtitle: 'Sugar ≤ 5 g per 100 g',
    introVariants: [
      'Low-sugar foods (≤5 g/100 g) form the base of patterns that target glycemic stability or added-sugar reduction. Most are unprocessed proteins, vegetables, and certain whole grains.',
      'These foods sit naturally below the "low-sugar" threshold without reformulation. Whole-food sources of sweetness (some fruits, dairy) appear with their natural sugars labelled.',
      'For anyone tracking added sugars or managing blood glucose, foods on this list are the easiest defaults — no label-reading gymnastics needed.',
    ],
    contextVariants: [
      'Current US guidelines cap added sugars at <10% of energy (about 50 g for 2,000 kcal). Foods at this density don\'t move the needle either way, leaving room for occasional indulgences elsewhere.',
      'Natural sugars (in fruit, dairy) come bundled with fibre, micronutrients, and water — the metabolic response is meaningfully different from added sugars. Both count toward "total" but only one counts toward "added".',
      'For glucose management, eating low-sugar foods alongside fibre and protein flattens post-meal spikes more than low-sugar eaten alone.',
    ],
    caveatVariants: [
      'Some low-sugar processed foods compensate with extra fat or sodium for flavour. The full label tells the story; the sugar column alone doesn\'t.',
      'Artificial sweeteners often appear in low-sugar products. The evidence on long-term effects is mixed; whole-food alternatives sidestep the question entirely.',
      'A 100 g basis flatters foods you\'d eat in larger portions. The figure works for comparison; convert to your actual serving for daily-intake tracking.',
    ],
  },
  'low-fat': {
    title: 'Low-fat foods',
    subtitle: 'Fat ≤ 3 g per 100 g',
    introVariants: [
      'Low-fat foods (≤3 g/100 g) match the FDA\'s "low fat" labelling threshold. Most are vegetables, fruits, lean meats, and certain dairy options — naturally low without reformulation.',
      'These foods deliver protein, carbs, fibre, and micronutrients with minimal fat contribution. Useful for calorie-controlled patterns or specific fat-restricted protocols.',
      'When the goal is to control total or saturated fat, building around low-fat whole foods is the cleanest approach — no need to read every label.',
    ],
    contextVariants: [
      'The "low-fat" era of the 1990s overshot — replacing fat with refined carbs created its own problems. Modern guidance favours fat quality (more unsaturated, less saturated) over fat quantity.',
      'For people managing specific GI conditions, fat-malabsorption issues, or post-bariatric, low-fat foods serve a clinical role beyond general healthy-eating advice.',
      'Low-fat dairy and meats keep the protein and micronutrient density of their full-fat counterparts while cutting saturated fat — a useful trade-off in calorie-controlled patterns.',
    ],
    caveatVariants: [
      'Some low-fat reformulated products replace fat with sugar or starch, raising the carb load. Read the label rather than trusting the front-of-pack claim.',
      'Fat carries fat-soluble vitamins (A, D, E, K) — extreme fat restriction limits absorption. Most adults don\'t need to push fat below ~20% of energy.',
      'Low-fat doesn\'t mean low-calorie. Some foods on this list still carry meaningful calories from carbs or protein.',
    ],
  },
  'low-carb': {
    title: 'Low-carb foods',
    subtitle: 'Carbs ≤ 5 g per 100 g',
    introVariants: [
      'Low-carb foods (≤5 g/100 g) anchor keto, low-carb, and carb-conscious dietary patterns. Most are proteins, fats, and non-starchy vegetables.',
      'These foods sit comfortably within ketogenic carb limits — typically <50 g/day total. A 100 g serving uses ≤10% of that quota.',
      'For anyone managing blood glucose or following a low-carb approach, building meals from this list keeps daily carbs in target range without constant calculation.',
    ],
    contextVariants: [
      'Low-carb patterns show benefit for type 2 diabetes management, certain seizure conditions, and short-term weight loss. Long-term cardiovascular outcomes depend heavily on the fat sources chosen alongside.',
      'Net carbs (total minus fibre) is the metric most low-carb communities use; the totals below are total carbs, so the net figure is lower for fibre-rich items.',
      'Pairing low-carb foods with adequate fibre and protein supports satiety even when carb intake is low. The risk on extreme low-carb is under-eating fibre, not under-eating carbs.',
    ],
    caveatVariants: [
      'Going very low-carb shifts metabolism in ways that affect electrolyte balance — sodium, potassium, magnesium needs nudge upward. Adequate intake of these matters more than on a standard diet.',
      'Some low-carb products use sugar alcohols (erythritol, allulose) to lower the carb count. Most tolerate these well; some get GI distress at higher doses.',
      'Low-carb is not synonymous with healthy. Bacon and butter are low-carb; so are leafy greens. The composition matters more than the carb number alone.',
    ],
  },
  'high-vitamin-c': {
    title: 'High-vitamin-C foods',
    subtitle: 'Vitamin C ≥ 30 mg per 100 g',
    introVariants: [
      'High-vitamin-C foods (≥30 mg/100 g) clear the FDA\'s "good source" threshold and often the "excellent" mark (≥18 mg/100 g). Citrus, peppers, certain leafy greens, and tropical fruits dominate.',
      'A 100 g serving from this list covers 30%+ of the daily 90 mg DV — enough that one or two servings cover most adults\' daily vitamin C need from food alone.',
      'Vitamin C supports immune function, collagen synthesis, and non-heme iron absorption. Whole-food sources also bring polyphenols and fibre that supplements miss.',
    ],
    contextVariants: [
      'Vitamin C is water-soluble and not stored in meaningful amounts — daily intake matters more than mega-doses. Foods at this density make hitting the 90 mg target trivial.',
      'For smokers or post-illness recovery, the requirement nudges higher (~125 mg). A second serving from this list covers the elevated need without supplementation.',
      'The non-heme iron absorption boost from vitamin C is real and clinically meaningful — pairing iron-rich plants with these foods at the same meal can double or triple absorption.',
    ],
    caveatVariants: [
      'Heat and prolonged storage degrade vitamin C — boiling can cut it 30–50%. Raw, lightly steamed, or briefly cooked preparations preserve the most.',
      'High-dose supplementation (>500 mg/day) has unclear long-term benefit and can cause GI distress. Whole-food intake is self-limiting and well-tolerated.',
      'Some high-vitamin-C foods (fortified juices) add sugar; whole-food sources keep the vitamin without the calorie load.',
    ],
  },
  'high-calcium': {
    title: 'High-calcium foods',
    subtitle: 'Calcium ≥ 100 mg per 100 g',
    introVariants: [
      'High-calcium foods (≥100 mg/100 g) reach the FDA\'s "good source" threshold and beyond. Dairy, fortified plant milks, leafy greens, and certain fish dominate the list.',
      'Calcium supports bone density, muscle contraction, and nerve signaling. Adults need 1,000–1,200 mg daily; foods on this list contribute 10%+ per 100 g.',
      'Building 2–3 servings from this list into a typical day covers the daily calcium target without supplementation for most adults.',
    ],
    contextVariants: [
      'Calcium absorbs better when split across meals rather than taken in a single large dose. The body caps absorption around 500 mg per intake.',
      'Vitamin D status drives calcium absorption — without adequate D, calcium intake doesn\'t fully translate to bone or blood. Sun exposure, salmon, eggs, or D-fortified foods support the pair.',
      'Plant-source calcium (greens, fortified milks) absorbs slightly less efficiently than dairy on a per-mg basis, but typically compensates with larger or more frequent servings.',
    ],
    caveatVariants: [
      'Spinach and Swiss chard list as calcium-containing but the oxalates bind much of it — bioavailable calcium is lower than the raw number suggests. Kale, broccoli, and bok choy don\'t share the issue.',
      'Calcium supplements above ~1,000 mg/day have shown mixed cardiovascular signals; food-source calcium hasn\'t. Whole foods are the safer route for high intake.',
      'Caffeine and high sodium increase calcium loss; neither destroys the day\'s intake but both nudge requirements upward at the margin.',
    ],
  },
  'high-iron': {
    title: 'High-iron foods',
    subtitle: 'Iron ≥ 2 mg per 100 g',
    introVariants: [
      'High-iron foods (≥2 mg/100 g) cover red meats, organ meats, certain seafoods, legumes, and some leafy greens. Heme iron (animal sources) absorbs 15–35%; non-heme iron (plant sources) 2–20%.',
      'Adults need 8–18 mg of iron daily depending on age and sex. Foods on this list contribute 10%+ per 100 g — meaningful, especially for menstruating women and active adults.',
      'For anyone with low ferritin or iron-deficiency anemia, building meals around foods on this list moves the needle in 2–4 weeks of consistent intake.',
    ],
    contextVariants: [
      'Vitamin C eaten alongside non-heme iron sources increases absorption 2–3×. Pairing lentils with citrus, or beans with bell peppers, doubles the practical iron uptake.',
      'Calcium and iron compete for absorption when consumed together — separating them by 1–2 hours improves both. This matters most for supplements; meal-level effects are smaller.',
      'Heme iron (meat, seafood) absorbs without the cofactor dance non-heme iron requires. Plant-based eaters need higher total intake to match heme-source absorption.',
    ],
    caveatVariants: [
      'Coffee and tea polyphenols cut non-heme iron absorption by 50–80% when consumed at the same meal. Time them outside iron-focused meals if you\'re working on iron status.',
      'Excess iron is harmful in those with hemochromatosis or related conditions. Most adults can\'t over-consume from food alone, but supplementation needs medical guidance.',
      'Cooking in cast iron transfers small but measurable amounts of iron to food, especially acidic dishes — a quiet addition to long-term intake.',
    ],
  },
  'high-potassium': {
    title: 'High-potassium foods',
    subtitle: 'Potassium ≥ 350 mg per 100 g',
    introVariants: [
      'High-potassium foods (≥350 mg/100 g) help most adults close the gap to the 4,700 mg daily target. Bananas, beans, potatoes, leafy greens, and certain fish lead the list.',
      'Potassium supports blood-pressure regulation, fluid balance, and muscle function. Most US adults consume well below the target — foods on this list move that picture meaningfully.',
      'A 100 g serving from this list contributes 7%+ of the daily 4,700 mg DV — and many items here clear 500 mg, double that share.',
    ],
    contextVariants: [
      'Potassium and sodium act as counterweights for blood pressure regulation. High-potassium foods partially offset the effect of high-sodium ones; both directions matter for cardiovascular outcomes.',
      'Most potassium intake recommendations apply to adults without kidney disease. Those with reduced kidney function need medical guidance — high-potassium foods can be problematic, not protective.',
      'Whole-food potassium comes bundled with magnesium, fibre, and other minerals also under-consumed in typical diets. The package is hard to replicate with supplements.',
    ],
    caveatVariants: [
      'Cooking method affects potassium retention — boiling vegetables and discarding the water can cut potassium 30–50%. Steaming or roasting preserves more.',
      'Potassium supplements are tightly regulated for cardiovascular safety; food sources don\'t share that concern. Whole-food intake is the recommended route.',
      'For those on certain blood-pressure medications (ACE inhibitors, ARBs, potassium-sparing diuretics), high-potassium foods need monitoring. Most adults don\'t face this constraint.',
    ],
  },
  'low-cholesterol': {
    title: 'Low-cholesterol foods',
    subtitle: 'Cholesterol ≤ 20 mg per 100 g',
    introVariants: [
      'Low-cholesterol foods (≤20 mg/100 g) cover plants entirely (which contain none) and lean animal proteins. Eggs, organ meats, and certain seafood sit higher on the cholesterol scale.',
      'Dietary cholesterol\'s influence on blood cholesterol is smaller than once thought — saturated and trans fats matter more for most people. The 300 mg/day cap was relaxed in recent US guidelines.',
      'For those with familial hypercholesterolemia or strong dietary cholesterol response, foods on this list serve a more direct role.',
    ],
    contextVariants: [
      'Plant foods contain zero cholesterol. The category functionally splits into "plants" (cholesterol-free by default) and "lean animal sources" (low but present).',
      'Saturated fat tends to drive LDL cholesterol more than dietary cholesterol does. Foods low in both — most plants, lean fish, skinless poultry — are the cleanest combination.',
      'Soluble fibre (oats, beans, certain fruits) actively lowers LDL; pairing low-cholesterol foods with high-fibre ones compounds the cardiovascular benefit.',
    ],
    caveatVariants: [
      'Eggs are nutritionally rich and safe in moderation for most adults despite their cholesterol content. The dietary-cholesterol cap was relaxed in part because of egg-specific evidence.',
      'For people with type 2 diabetes, dietary cholesterol effects on blood cholesterol may be more pronounced. Individual response matters more than population averages.',
      'Low-cholesterol foods are not automatically heart-healthy — many ultra-processed plant foods qualify but bring high sodium or refined carbs.',
    ],
  },
  'low-saturated-fat': {
    title: 'Low-saturated-fat foods',
    subtitle: 'Saturated fat ≤ 1 g per 100 g',
    introVariants: [
      'Low-saturated-fat foods (≤1 g/100 g) clear the FDA labelling threshold. Most are plants, lean fish, skinless poultry, and non-fat dairy.',
      'Saturated fat\'s influence on LDL cholesterol is the cleanest dietary-fat story. Foods on this list don\'t contribute to that pathway.',
      'Building patterns around foods on this list keeps saturated fat well below the 10%-of-energy guideline for most adults.',
    ],
    contextVariants: [
      'Recent research nuances the saturated-fat picture — source matters (dairy fat ≠ processed meat fat), and overall pattern outweighs single-nutrient focus. The cap remains, but with caveats.',
      'For people with elevated LDL or cardiovascular risk, the saturated-fat cap (≤7% of energy) is firmer. Foods on this list make that target reachable without extreme restriction.',
      'Replacing saturated fat with unsaturated fat lowers cardiovascular risk; replacing it with refined carbs doesn\'t. The substitution direction matters as much as the reduction.',
    ],
    caveatVariants: [
      'Fat-free reformulated products often replace saturated fat with sugar or starch — neither necessarily improves the cardiovascular profile. Read the full label.',
      'Tropical oils (coconut, palm) are plant-source but high in saturated fat — they don\'t qualify for this list despite being plants.',
      'Some low-saturated-fat foods carry high sodium or sugar. The single-nutrient lens misses the bigger picture.',
    ],
  },
  'ultra-low-calorie': {
    title: 'Ultra-low-calorie foods',
    subtitle: 'Under 30 kcal per 100 g',
    introVariants: [
      'Ultra-low-calorie foods (under 30 kcal/100 g) are dominated by water content. Cucumbers, lettuces, broths, summer squash — items where 80–95% of mass is water.',
      'These are the foods that fill the plate at almost no calorie cost. Used as the "stretch" component of meals, they expand portion size without expanding the calorie load.',
      'A 100 g serving here costs less than a glass of milk\'s worth of calories. Practical for anyone tracking calories closely or wanting to eat by volume.',
    ],
    contextVariants: [
      'The lowest-density foods consistently appear in volumetric eating, intuitive eating, and most clinical weight-management protocols. The mechanism is straightforward: stomach stretch + minimal calories.',
      'Cooking method matters more here than for any other category. A 16 kcal cucumber with dressing becomes a 200 kcal side; the raw figure is the floor.',
      'Most ultra-low-cal foods carry meaningful potassium, vitamin C, and fibre alongside the negligible calories — the value-per-100 g is high.',
    ],
    caveatVariants: [
      'Building meals entirely from ultra-low-cal foods leaves macros incomplete. Use them as fillers and stretchers, not as the meal itself.',
      'Some items qualify on a per-100 g basis but are rarely consumed at that volume (raw garlic, hot peppers). The list works for comparison, not as a serving guide.',
      'Watch sodium for canned and prepared versions — broths, pickles, and processed pickled items often spike sodium even when calories stay low.',
    ],
  },
  'high-protein-low-calorie': {
    title: 'High-protein, low-calorie foods',
    subtitle: 'Protein ≥ 15 g, calories ≤ 150 per 100 g',
    introVariants: [
      'High-protein, low-calorie foods (≥15 g protein, ≤150 kcal per 100 g) sit at the intersection of two of the most-asked nutritional questions. Lean meats, low-fat dairy, certain seafood, and egg whites lead the list.',
      'These are the foods that let you hit a daily protein target without using up calorie budget. Density is the win: ≥10% of calories from protein, often substantially more.',
      'For anyone in a calorie deficit who wants to preserve lean mass, this list is the most useful in the database. Protein satiety + calorie control without the trade-off.',
    ],
    contextVariants: [
      'Protein retention during calorie deficits requires intake at or above 1.2 g/kg — higher than a maintenance diet. Foods at this density make that reachable without portion blowouts.',
      'These foods cover 60–70% of their calories from protein, vs ~15% for a typical mixed diet. The math compounds: smaller portions hit larger protein totals.',
      'Athletes, recompositioning eaters, and post-bariatric patients all rely on foods at this density. The clinical use cases are well-established.',
    ],
    caveatVariants: [
      'Many items here are prepared in ways that add sodium or sauces — check the source preparation. The core food usually qualifies; the prepared version often doesn\'t.',
      'Plant-based options at this density are rarer but exist (tempeh, seitan, certain legumes when fitted to the threshold). The list mixes both — note the source.',
      'Pair with fibre and vegetables to round out the meal. High-protein, low-cal foods alone leave fibre intake low; balance is the right move.',
    ],
  },
};

export function getListInsight(type: ListType): ListMeta {
  const profile = LIST_PROFILES[type];
  return {
    type,
    title: profile.title,
    subtitle: profile.subtitle,
    intro: pickVariant(type, profile.introVariants, 1),
    context: pickVariant(type, profile.contextVariants, 2),
    caveats: pickVariant(type, profile.caveatVariants, 3),
  };
}

export function getAllListTypes(): ListType[] {
  return Object.keys(LIST_PROFILES) as ListType[];
}

// ──────────────────────────────────────────────────────────────────
// /state/[slug]/  Layer 2 — uses existing state data (CDC BRFSS, USDA Farmers Markets)
// ──────────────────────────────────────────────────────────────────

export interface StateInsight {
  obesityNarrative: string;
  cuisineNarrative: string;
  practicalSwap: string;
}

export function getStateInsight(
  stateSlug: string,
  stateName: string,
  obesityRate: number | null,
  nationalObesityRate: number,
  popularCuisines: string[],
  farmersMarketsCount: number | null,
): StateInsight {
  const obesityDelta = obesityRate != null ? obesityRate - nationalObesityRate : null;

  const obesityNarrative = pickVariant(stateSlug, [
    obesityRate != null
      ? `${stateName}'s adult obesity rate (${obesityRate.toFixed(1)}%, CDC BRFSS) sits ${obesityDelta != null && obesityDelta > 0 ? `${obesityDelta.toFixed(1)} points above` : obesityDelta != null && obesityDelta < 0 ? `${Math.abs(obesityDelta).toFixed(1)} points below` : 'right at'} the national average of ${nationalObesityRate.toFixed(1)}%. The number tracks population-level patterns, not individual outcomes — but it shapes which dietary intervention questions get asked locally.`
      : `Adult obesity data for ${stateName} is reported through CDC BRFSS but not always at high resolution. The national reference of ${nationalObesityRate.toFixed(1)}% provides context.`,
    obesityRate != null
      ? `Per CDC BRFSS, ${obesityRate.toFixed(1)}% of ${stateName} adults qualify as obese — the national figure is ${nationalObesityRate.toFixed(1)}%. Patterns at this scale reflect food access, demographics, and cultural cuisine more than any single dietary choice.`
      : `${stateName}'s obesity figures come from CDC BRFSS surveys; the national reference rate is ${nationalObesityRate.toFixed(1)}%.`,
    obesityRate != null
      ? `${obesityRate.toFixed(1)}% of adults in ${stateName} are classified as obese (CDC BRFSS). For comparison, the US average is ${nationalObesityRate.toFixed(1)}%. The gap, where it exists, often reflects regional food culture and access patterns rather than individual habits.`
      : `Population-level obesity data for ${stateName} draws from CDC BRFSS, with national context at ${nationalObesityRate.toFixed(1)}%.`,
  ], 1);

  const cuisineNarrative = popularCuisines.length
    ? pickVariant(stateSlug, [
        `Locally, ${stateName}'s cuisine traditions lean toward ${popularCuisines.slice(0, 3).join(', ')} — each carrying its own nutritional fingerprint. The food culture isn't a problem to solve; it's the context any dietary planning has to work with.`,
        `${stateName}'s table is shaped by ${popularCuisines.slice(0, 3).join(', ')} traditions. Working with these patterns — modifying preparation, swapping in lower-density ingredients — usually beats fighting them.`,
        `${popularCuisines.slice(0, 3).join(', ')} dominate ${stateName}'s regional cuisine. Most practical dietary changes come from preparation tweaks within these patterns, not abandoning them.`,
      ], 2)
    : pickVariant(stateSlug, [
        `Regional cuisine shapes day-to-day eating more than any national guideline. ${stateName}'s patterns blend with broader American defaults.`,
        `${stateName}'s food culture mirrors broader regional and national patterns; specific local cuisines vary by community.`,
      ], 2);

  const practicalSwap = pickVariant(stateSlug, [
    farmersMarketsCount != null && farmersMarketsCount > 0
      ? `${stateName} hosts ${fmtCount(farmersMarketsCount)} farmers markets per the USDA Farmers Market Directory — a practical channel for fresher produce and lower-density alternatives to many grocery defaults.`
      : `Local food access varies across ${stateName}, but most regions support some combination of farmers markets, CSAs, and grocery options for fresh whole-food choices.`,
    farmersMarketsCount != null && farmersMarketsCount > 0
      ? `For practical produce access, ${fmtCount(farmersMarketsCount)} farmers markets operate across ${stateName} (USDA directory). Seasonal availability shifts the math; in-season produce is typically denser in nutrients and lower in cost.`
      : `Whole-food access in ${stateName} blends grocery, farmers market, and direct-from-producer channels depending on the community.`,
    farmersMarketsCount != null && farmersMarketsCount > 0
      ? `${stateName}'s ${fmtCount(farmersMarketsCount)} listed farmers markets (USDA) offer one of the cleanest paths to lower-density, fresher swaps for many staples — though access varies by community and season.`
      : `Fresh whole-food access in ${stateName} depends on local channels. Most communities offer at least one of farmers markets, CSAs, or full-service groceries.`,
  ], 3);

  return { obesityNarrative, cuisineNarrative, practicalSwap };
}
