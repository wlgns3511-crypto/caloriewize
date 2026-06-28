/**
 * Hub-level "How to read…" 4-paragraph reader-help generators.
 *
 * One module for the five hub surfaces (list/[type], category/[slug],
 * state/[slug], food/, list/). Each generator returns the four slots
 * the HubReaderHelp component renders:
 *
 *   1. dimensionReading   — how to read the primary axis on this hub
 *   2. commonMisreadings  — typical misinterpretation risks
 *   3. notCaptured        — what the hub does not include or guarantee
 *   4. practicalUse       — descriptive way to apply the data
 *
 * Sources are USDA FoodData Central, FDA Daily Values / 21 CFR claim
 * thresholds, NIH RDAs, NHLBI DASH (NIH Pub. 06-4082), CDC BRFSS, and
 * the USDA Farmers Market Directory — verbatim citations only.
 */
import type { ListType } from './food-cluster-insights';

export interface HubReaderHelpParagraphs {
  dimensionReading: string;
  commonMisreadings: string;
  notCaptured: string;
  practicalUse: string;
}

// ──────────────────────────────────────────────────────────────────
// list/[type]/  — 15 list-type variants
// ──────────────────────────────────────────────────────────────────

interface ListAxisProfile {
  unit: string;            // "kcal", "g", "mg"
  axis: string;            // "calorie density", "protein concentration", …
  sortPhrase: string;      // "lowest calories first", "highest protein first", …
  misreading: string;      // dimension-specific common misreading
  notCaptured: string;     // dimension-specific gap
  practicalUse: string;    // dimension-specific descriptive use
}

const LIST_AXIS_PROFILES: Record<ListType, ListAxisProfile> = {
  'low-calorie': {
    unit: 'kcal',
    axis: 'calorie density per 100 g',
    sortPhrase: 'lowest first',
    misreading:
      'A 100-g reference is energy density, not the calories of an actual portion. A 30-g serving of an item listed at 100 kcal/100 g delivers 30 kcal, not 100. Cooking with oil, sugar, or sauces is additive on top of the listed value.',
    notCaptured:
      'The list does not encode glycemic load, insulin response, satiety per kcal, or how the food behaves in a mixed meal. Two items with the same calorie density can produce very different post-meal hunger curves.',
    practicalUse:
      'Use this list as a base for high-volume meals where you want to fill the plate without raising the energy total. The FDA Daily Value reference for total energy is 2,000 kcal/day; pair these picks with smaller portions of more energy-dense foods rather than treating them as a complete pattern.',
  },
  'high-protein': {
    unit: 'g',
    axis: 'protein concentration per 100 g',
    sortPhrase: 'highest first',
    misreading:
      'USDA protein is total Kjeldahl nitrogen × 6.25 — it does not separate complete from incomplete proteins. Plant entries (legumes, grains) score lower on the FAO DIAAS scale than the gram total suggests, and dairy / animal entries cluster higher.',
    notCaptured:
      'The list does not encode DIAAS (digestible indispensable amino-acid score), leucine threshold, anti-nutrient effects (e.g., legume trypsin inhibitors, raw-egg avidin), or the protein loss / gain that occurs in cooking and processing.',
    practicalUse:
      'Walk the list to find dense per-100-g picks for hitting a daily protein target. The FDA Daily Value is 50 g protein for a 2,000-kcal reference diet; the USDA Dietary Guidelines for Americans 2020-2025 recommend 10-35 % of calories from protein, so the per-100-g figure here is one input, not the whole plan.',
  },
  'high-fiber': {
    unit: 'g',
    axis: 'total dietary fiber per 100 g',
    sortPhrase: 'highest first',
    misreading:
      'USDA fiber is total dietary fiber by AOAC 991.43 — it lumps soluble and insoluble fractions into a single number. Two items with identical fiber gram totals can have very different fermentation profiles, viscosity, and FODMAP loads.',
    notCaptured:
      'The list does not split soluble vs insoluble fiber, name the specific fibers (β-glucan, inulin, pectin, resistant starch), or encode how fiber survives cooking, drying, or refining.',
    practicalUse:
      'Most US adults fall short of the FDA Daily Value of 28 g/day. Use these entries as the dense picks at the top of the distribution, but remember that mixing fiber types tends to track better outcomes than maximising any one source.',
  },
  'low-sodium': {
    unit: 'mg',
    axis: 'sodium per 100 g',
    sortPhrase: 'lowest first',
    misreading:
      'Sodium is reported as packaged. Cured, canned, and sauced entries reflect the manufacturer formulation; rinsing canned beans or draining brine can drop sodium by 30-40 % from the listed value, and added table salt at the table is not in the database at all.',
    notCaptured:
      'The list does not capture salt added in cooking, soy / fish / tamari sauces poured at serving, or restaurant-prepared versions of the same food. The 100-g figure is the unprepared row, not your actual meal.',
    practicalUse:
      'The FDA "low sodium" claim threshold (21 CFR §101.61) is ≤140 mg per reference amount. Items at the top of this list already clear that bar. The FDA Daily Value upper bound is 2,300 mg/day — this list is a structural input toward that ceiling, not a replacement for measuring overall intake.',
  },
  'low-sugar': {
    unit: 'g',
    axis: 'total sugars per 100 g',
    sortPhrase: 'lowest first',
    misreading:
      'USDA total sugars combines naturally occurring sugars (lactose in dairy, fructose in fruit) with added sugars from manufacturing. The database does not yet flag added vs intrinsic, so a banana and a cookie with the same sugar gram total are not nutritionally equivalent.',
    notCaptured:
      'The list does not separate added from intrinsic sugar, encode glycemic load, or distinguish fructose-glucose ratio. Sugar-alcohols and non-nutritive sweeteners do not appear in this column.',
    practicalUse:
      'The FDA Daily Value for added sugars is 50 g/day. Use this list to identify per-100-g picks that crowd out concentrated added-sugar items, then check whether each top-of-list entry is naturally sugary (e.g., dairy, fruit) or genuinely low across both definitions.',
  },
  'low-fat': {
    unit: 'g',
    axis: 'total fat per 100 g',
    sortPhrase: 'lowest first',
    misreading:
      'Total fat conflates saturated, monounsaturated, polyunsaturated, and trans fats into one number. Two items with identical total fat can have very different cardiovascular profiles depending on the saturated fraction. Cross-reference with low-saturated-fat for the FDA-tracked subcomponent.',
    notCaptured:
      'The list does not encode omega-3 / omega-6 ratio, trans-fat (only reported when ≥0.5 g per FDA labeling rules), specific fatty-acid profile, or how cooking method changes the fat profile.',
    practicalUse:
      'Fat is essential — this list supports high-volume meal building, not a low-fat-as-goal dietary pattern. The USDA Dietary Guidelines for Americans 2020-2025 set 20-35 % of calories from total fat, so the per-100-g figure here informs choices, not a daily target.',
  },
  'low-carb': {
    unit: 'g',
    axis: 'total carbohydrate per 100 g',
    sortPhrase: 'lowest first',
    misreading:
      'USDA total carbs include fiber. "Net carbs" — total minus fiber — is not a USDA-tracked column, so an item with 10 g total / 5 g fiber and an item with 5 g total / 0 g fiber can rank far apart here while being nearly equivalent under a net-carb definition.',
    notCaptured:
      'The list does not encode glycemic index, resistant starch, sugar alcohols, or how carb content changes after cooking, soaking, or fermentation.',
    practicalUse:
      'For very-low-carbohydrate or NIH NCBI StatPearls clinical-ketogenic patterns (target <10 % of calories from carbohydrate), cross-reference with the per-food page\'s minimally-processed fit indicator before treating any per-100-g pick as a pattern fit.',
  },
  'high-vitamin-c': {
    unit: 'mg',
    axis: 'vitamin C per 100 g',
    sortPhrase: 'highest first',
    misreading:
      'Vitamin C is heat-, light-, and oxygen-sensitive — typical cooking loss is 25-50 %. USDA values are for the row as analyzed (raw unless the entry name includes "cooked"); pickling, freezing, and long storage all reduce the in-mouth dose.',
    notCaptured:
      'The list does not split bioavailable vs total ascorbate, encode the vitamin-C → iron-absorption synergy, or capture stability across cooking method. Most fortified-juice values reflect the manufacturer formulation, not retention after warming.',
    practicalUse:
      'NIH RDA is 90 mg/day for adult men and 75 mg/day for adult women (NIH Office of Dietary Supplements). Top-of-list entries cover the daily target in a single 100-g portion; use them as the freshness anchor of a meal rather than a single-shot supplementation lever.',
  },
  'high-calcium': {
    unit: 'mg',
    axis: 'calcium per 100 g',
    sortPhrase: 'highest first',
    misreading:
      'Calcium gram totals do not encode bioavailability. NIH ODS reports dairy at roughly 32 % absorption while leafy greens range from 5 % (high-oxalate spinach) to 50 % (low-oxalate kale, bok choy). Two items with the same per-100-g calcium can deliver very different absorbed doses.',
    notCaptured:
      'The list does not encode oxalate inhibition, vitamin-D status (which gates absorption), phytate load (in some grains and legumes), or fortification source on enriched products.',
    practicalUse:
      'NIH RDA is 1,000 mg/day for adults 19-50 and 1,200 mg/day for women 51+ (NIH Office of Dietary Supplements). Use this list to identify dense per-100-g picks; pair with vitamin-D sources for absorption, and cross-reference with the per-food page\'s minimally-processed fit indicator for whole-food versions.',
  },
  'high-iron': {
    unit: 'mg',
    axis: 'iron per 100 g',
    sortPhrase: 'highest first',
    misreading:
      'Iron in animal foods (heme) absorbs 5-15× better than iron in plant foods (non-heme), per NIH ODS. USDA reports total iron in mg, with no heme/non-heme split, so a plant entry near the top of this list does not deliver the same absorbed iron as a meat entry with the same gram total.',
    notCaptured:
      'The list does not split heme vs non-heme, encode the vitamin-C co-absorption boost, or capture phytate / polyphenol inhibition (tea, coffee, and certain legumes reduce non-heme uptake).',
    practicalUse:
      'NIH RDA is 8 mg/day for adult men and post-menopausal women, 18 mg/day for menstruating women, and 27 mg/day in pregnancy (NIH Office of Dietary Supplements). Use this list as a per-100-g shortlist, but read it together with the FDA Daily Value (18 mg) and the heme/non-heme caveat above.',
  },
  'high-potassium': {
    unit: 'mg',
    axis: 'potassium per 100 g',
    sortPhrase: 'highest first',
    misreading:
      'Potassium leaches into cooking water — boiling vegetables can drop potassium 30-50 % from the raw row in the database. USDA entries are typically as-analyzed for the named row, so a "boiled" entry will already reflect that loss, but recipes that boil a "raw" entry will not.',
    notCaptured:
      'The list does not encode the dialysis-relevant mEq vs mg conversion, sodium/potassium ratio (NHLBI DASH-relevant), or the potassium content of cooking liquid that is then drained.',
    practicalUse:
      'The FDA Daily Value is 4,700 mg/day. Most US adults fall below this — NHANES survey medians are typically 2,500-3,000 mg/day. Use this list to identify dense per-100-g picks that lift the daily total without changing the rest of the plate.',
  },
  'low-cholesterol': {
    unit: 'mg',
    axis: 'cholesterol per 100 g',
    sortPhrase: 'lowest first',
    misreading:
      'Cholesterol is a animal-source-only molecule — every plant entry is 0 mg by definition, so the bottom of this list is densely packed with plant items that all rank tied. The interesting signal is among the animal entries, where tissue type (organ vs muscle vs lean dairy) matters more than the per-100-g number alone.',
    notCaptured:
      'The list does not encode phytosterols (plant compounds that displace cholesterol absorption), lecithin content, or how cooking method (frying vs grilling vs boiling) affects retention.',
    practicalUse:
      'The FDA Daily Value reference is 300 mg/day. The USDA Dietary Guidelines for Americans 2020-2025 emphasize dietary patterns over single-nutrient targets; use this list as one input alongside saturated fat and overall pattern, not as a standalone goal.',
  },
  'low-saturated-fat': {
    unit: 'g',
    axis: 'saturated fat per 100 g',
    sortPhrase: 'lowest first',
    misreading:
      'Saturated fat is a class — palmitic, stearic, lauric, myristic acids all count, but they have measurably different effects on blood lipids per the NIH literature. USDA reports the class total, not the breakdown, so two entries with the same saturated-fat gram total may not be equivalent in cardiometabolic outcomes.',
    notCaptured:
      'The list does not encode the specific fatty-acid profile, the food matrix (dairy fat in fermented yogurt vs cheese behaves differently), or how processing has redistributed fat fractions.',
    practicalUse:
      'The FDA "low saturated fat" claim threshold (21 CFR §101.62) is ≤1 g per reference amount. Top-of-list items already clear that bar. The FDA Daily Value upper bound is 20 g/day for a 2,000-kcal reference diet — this list helps build the structural floor under that ceiling.',
  },
  'ultra-low-calorie': {
    unit: 'kcal',
    axis: 'calorie density per 100 g (under 30 kcal)',
    sortPhrase: 'lowest first, capped at 30 kcal/100 g',
    misreading:
      'Below 30 kcal per 100 g is functionally water-rich produce, broth, and leafy items. The "calories" of an actual cooked dish are dominated by what you add (oil, dressing, cheese, croutons), not the base ingredient that ranks here. Treating a 12-kcal-per-100-g item as your serving calorie count under-counts the meal.',
    notCaptured:
      'The list does not capture preparation calories, palatability constraints (very few people eat 500 g of celery in one sitting), satiety per kcal, or the specific micronutrients these items concentrate in.',
    practicalUse:
      'Use as the volume base of a meal where you want bulk without energy density — soups, salads, stir-fries. The FDA Daily Value for total energy is 2,000 kcal/day; ultra-low-calorie picks displace energy-dense items rather than functioning as a complete pattern on their own.',
  },
  'high-protein-low-calorie': {
    unit: 'g',
    axis: 'protein-to-calorie ratio (≥15 g protein, ≤150 kcal per 100 g)',
    sortPhrase: 'highest ratio first',
    misreading:
      'A ratio collapses two dimensions into one. An item at 20 g protein / 100 kcal and an item at 40 g protein / 200 kcal rank similarly, but the second contributes twice the absolute protein per 100 g. The "Protein" column on this page reports the absolute gram total — read both before treating any rank as a complete signal.',
    notCaptured:
      'The list does not encode DIAAS or amino-acid completeness (USDA reports total Kjeldahl nitrogen × 6.25 only), cooking shrinkage on meat / fish, or moisture content that varies under preparation.',
    practicalUse:
      'These are the lean-protein workhorses — useful when you want to add protein without proportionally adding calories. Cross-reference with the per-food page\'s ketogenic-clinical and minimally-processed fits to filter for whole-food vs reformulated versions.',
  },
  'sodium-potassium-balance': {
    unit: 'mg',
    axis: 'sodium-to-potassium molar ratio per 100 g',
    sortPhrase: 'lowest ratio first',
    misreading:
      'A low ratio can come from very high potassium OR from near-zero sodium — the rank rewards both. A near-salt-free food with modest potassium can sit beside a potassium-dense one. The "Potassium" column on this page reports the absolute mg; read it alongside the rank before treating a food as a potassium source.',
    notCaptured:
      'The ratio is computed from USDA per-100 g sodium and potassium only. It does not encode salt added at the table or in cooking, the food\'s actual serving size, other electrolytes (magnesium, chloride), or any individual\'s kidney function — the single factor that can invert whether a high-potassium food is advisable.',
    practicalUse:
      'Use the top of this list as the potassium-forward, low-sodium base the DASH pattern is built on. The WHO dietary target is a molar Na:K ratio at or below 1 and the potassium Daily Value is 4,700 mg; these picks are one input toward both, not a blood-pressure plan — follow a clinician for medical context.',
  },
};

export function getListReaderHelp(listType: ListType, _title: string): HubReaderHelpParagraphs {
  const p = LIST_AXIS_PROFILES[listType];
  return {
    dimensionReading: `This list ranks USDA FoodData Central rows by ${p.axis}, ${p.sortPhrase}. Every value is per 100 g of the food as named in the row — not per serving and not per package. The "${p.unit}" column is the rank dimension; the calories column on the right is shown for context, not as a secondary sort.`,
    commonMisreadings: p.misreading,
    notCaptured: p.notCaptured,
    practicalUse: p.practicalUse,
  };
}

// ──────────────────────────────────────────────────────────────────
// category/[slug]/  — 24 USDA categories
// ──────────────────────────────────────────────────────────────────

export interface CategoryReaderHelpInputs {
  categoryName: string;
  count: number;
  calMean: number;
  calMedian: number;
  calP90: number;
  proteinMedian: number;
  fiberMean: number;
  sodiumP90: number;
}

export function getCategoryReaderHelp(c: CategoryReaderHelpInputs): HubReaderHelpParagraphs {
  const lc = c.categoryName.toLowerCase();
  const meanVsMedianGap = Math.abs(c.calMean - c.calMedian);
  const skewed = meanVsMedianGap > c.calMedian * 0.15;

  return {
    dimensionReading: `The "Category at a glance" panel summarises ${c.count.toLocaleString()} ${lc} items per 100 g. The mean (${c.calMean.toFixed(0)} kcal) is the arithmetic average across all rows; the median (${c.calMedian.toFixed(0)} kcal) is the middle row when sorted; the top-10 % cutoff (${c.calP90.toFixed(0)} kcal) is the threshold above which only one in ten items falls. The four sorted lists below the panel show specific high- and low-end rows that drive those numbers.`,
    commonMisreadings: skewed
      ? `The mean and median for ${lc} differ by ${meanVsMedianGap.toFixed(0)} kcal, which signals a skewed distribution — a small number of high-calorie outliers is pulling the mean up. Quoting "average ${lc} is ${c.calMean.toFixed(0)} kcal" misrepresents the typical row; the median is the more honest centre. Sorted lists often look more useful than aggregate stats for skewed categories.`
      : `Mean and median for ${lc} are close (${c.calMean.toFixed(0)} vs ${c.calMedian.toFixed(0)} kcal), so either is a reasonable centre measure here. The risk is treating the centre as a per-portion calorie number — a 30-g serving of an item at the median delivers a fraction of the per-100-g value.`,
    notCaptured: `Category aggregates do not capture cooking method (raw vs roasted vs fried changes everything), within-category variance (a top-decile item can be 3× the median), brand-level fortification differences, or how the items behave in mixed meals. The four sorted lists below — highest/lowest calorie, highest protein, highest fibre — surface specific rows that the aggregates flatten.`,
    practicalUse: `Use the median (${c.calMedian.toFixed(0)} kcal) as your "default ${lc}" anchor and the top-10 % cutoff (${c.calP90.toFixed(0)} kcal+) as the ceiling above which an item is energy-dense for the category. The full alphabetical list below lets you audit specific rows; cross-reference any item with its per-food page for full %DV breakdown and the 5-bucket dietary-fit lens.`,
  };
}

// ──────────────────────────────────────────────────────────────────
// state/[slug]/  — 51 jurisdictions (50 states + DC)
// ──────────────────────────────────────────────────────────────────

export interface StateReaderHelpInputs {
  stateName: string;
  obesityRate: number;
  nationalAvg: number;
  farmersMarkets: number;
  rank: number;
  totalStates: number;
}

export function getStateReaderHelp(s: StateReaderHelpInputs): HubReaderHelpParagraphs {
  const above = s.obesityRate > s.nationalAvg + 2;
  const below = s.obesityRate < s.nationalAvg - 2;

  return {
    dimensionReading: `${s.stateName} is shown alongside two CDC and USDA aggregates: the BRFSS adult obesity rate (${s.obesityRate}%) and the USDA Farmers Market Directory count (${s.farmersMarkets}). The obesity rate is a self-reported telephone-survey statistic adjusted for non-response; the farmers-market count is a registry of state-listed markets. Both are state-level — they describe the population, not any individual.`,
    commonMisreadings: `The state obesity rate is not a personal probability. Treating a ${s.obesityRate}% population statistic as "my chance of becoming obese in ${s.stateName}" misreads what the BRFSS sample produces — individual outcomes depend on age, income, race / ethnicity, food access, sleep, and dozens of factors the state aggregate flattens. ${above ? `The state ranks above the national average (${s.nationalAvg.toFixed(1)}%); zip-code-level disparities inside the state are typically larger than the state-vs-national gap.` : below ? `The state ranks below the national average (${s.nationalAvg.toFixed(1)}%); within-state disparities (urban vs rural, by income) are often larger than the state-vs-national gap.` : `The state is near the national average (${s.nationalAvg.toFixed(1)}%); within-state variation by county and income tends to dwarf the state-vs-national difference.`}`,
    notCaptured: `The page does not break out CDC BRFSS by income tier, race / ethnicity, age, or county; nor does it adjust farmers-market access for population density, transit, or rural distance to market. The "popular local foods" and "dietary trends" sections are descriptive of the state\'s food culture, not measured nutrition outcomes — they should be read as orientation, not as evidence the trends caused the obesity rate.`,
    practicalUse: `Use the state page as orientation about ${s.stateName}\'s food environment — where it ranks (#${s.rank} of ${s.totalStates} when sorted lowest to highest obesity), what foods are widely available, how dense the farmers-market network is. The page is descriptive context, not personal dietary advice; for individual planning, the per-food and category pages with FDA Daily Value % carry the actionable detail.`,
  };
}

// ──────────────────────────────────────────────────────────────────
// food/  — all-foods alphabetical hub
// ──────────────────────────────────────────────────────────────────

export function getFoodHubReaderHelp(totalCount: number): HubReaderHelpParagraphs {
  return {
    dimensionReading: `This index lists every food in the database — ${totalCount.toLocaleString()} entries — alphabetically by name, with calories per 100 g shown on the right. Every row is a USDA FoodData Central entry; the slug links to a per-food page with the full nutrient profile, FDA Daily Value % column, the 5-bucket dietary-fit lens (Mediterranean / Ketogenic / Minimally-processed / Low-sodium / DASH), and a 4-paragraph reader-help strip.`,
    commonMisreadings: `The alphabetical index collapses related rows that share a base name but represent different USDA data types — Foundation Foods (analytical mean), SR Legacy (single-source), and Branded (manufacturer-reported) entries can all coexist near each other. Two entries with similar names (e.g., "Apples, raw, with skin" vs "Apples, raw, without skin") are different rows, not the same food described twice.`,
    notCaptured: `The hub does not encode regional and colloquial synonyms (e.g., "scallion" vs "green onion" vs "spring onion"), variant naming across cuisines, or which row is the "default" version of an everyday food. Items prepared with named additives (oil, sugar, salt) appear as separate rows from the base ingredient.`,
    practicalUse: `For everyday lookup, the search bar in the navigation is faster than scrolling this index. Use the alphabetical hub when you know the USDA naming convention — typically a base food name followed by descriptors (e.g., "Beef, ground, 85 % lean") — and the category and list hubs when you want to discover items by dimension rather than by name.`,
  };
}

// ──────────────────────────────────────────────────────────────────
// list/  — 15 list-types hub
// ──────────────────────────────────────────────────────────────────

export function getListHubReaderHelp(listCount: number): HubReaderHelpParagraphs {
  return {
    dimensionReading: `This hub indexes ${listCount} ranked food lists, each sorting USDA rows by a single nutrient or calorie axis. Each list page returns the top 60 entries on its dimension along with the median, top-decile cutoff, and a per-100-g context column. Every food in every list links to its per-food page with FDA Daily Value % and the 5-bucket dietary-fit lens.`,
    commonMisreadings: `Lists are mechanical sorts, not curated recommendations. An item ranked #1 on "low-calorie" is not the "best" food — it is the lowest-calorie row in USDA. Two lists with overlapping items (e.g., "low-calorie" + "high-protein") do not automatically produce a "lean-protein" set; the overlap may include rows that clear both axes by being water-heavy or having reformulated nutrient labels.`,
    notCaptured: `The hub does not encode combined-criteria lists beyond the single combined ratio (high-protein-low-calorie). It does not separate naturally low-sodium items from manufactured "low-sodium" reformulations, naturally low-sugar items from sweetener-substituted versions, or whole-food lists from processed-food lists. The fit context lives on the per-food page, not in the list ranking.`,
    practicalUse: `Pair-walk two lists side by side for harder questions: items on both "high-fibre" and "low-sugar" tend to be whole grains and legumes; items on "high-potassium" and "low-sodium" track NHLBI DASH-style picks (NIH Pub. 06-4082). The cross-list patterns often matter more than any single ranking — but always verify on the per-food page before adopting any item into a regular pattern.`,
  };
}
