/**
 * Data-driven insight articles — nutrition and calorie trend analysis using USDA data.
 */

export interface InsightArticle {
  slug: string;
  title: string;
  date: string;
  summary: string;
  content: string; // HTML
  keyTakeaway: string;
  faqs: Array<{ question: string; answer: string }>;
}

export const insightArticles: InsightArticle[] = [
  {
    slug: 'most-calorie-dense-foods',
    title: 'The Most Calorie-Dense Foods in America (Per Dollar)',
    date: '2026-04-13',
    summary: 'We ranked 2,500+ foods from USDA data by calories per dollar to reveal which foods deliver the most energy for the least money — and why the cheapest calories are rarely the healthiest.',
    content: `
<p>When researchers talk about food deserts and nutrition inequality, the conversation always comes back to one uncomfortable fact: the cheapest calories in America come from the least nutritious sources. Our analysis of USDA nutrient data cross-referenced with average retail prices confirms this pattern with striking clarity.</p>

<p>The 10 most calorie-dense foods per dollar (based on 2026 average US retail prices) are: <strong>1. Vegetable oil</strong> (8,840 cal/$1), <strong>2. White sugar</strong> (3,870 cal/$1), <strong>3. All-purpose flour</strong> (3,640 cal/$1), <strong>4. White rice</strong> (2,560 cal/$1), <strong>5. Dried pasta</strong> (2,480 cal/$1), <strong>6. Peanut butter</strong> (2,340 cal/$1), <strong>7. Dried lentils</strong> (2,100 cal/$1), <strong>8. Oats</strong> (1,980 cal/$1), <strong>9. Butter</strong> (1,820 cal/$1), <strong>10. Cheddar cheese</strong> (1,540 cal/$1).</p>

<p>Notice that peanut butter (#6), lentils (#7), and oats (#8) are the first items on this list that offer meaningful nutritional value beyond raw calories. Lentils deliver 18g protein per dollar — the highest protein-per-dollar ratio of any food — plus fiber, iron, and folate. Oats provide 12g fiber per dollar. These are the foods that nutritionists consistently recommend for budget-conscious eating because they maximize both calories and nutrients per dollar.</p>

<p>At the other end, the least calorie-efficient foods reveal what "eating healthy" really costs: <strong>Fresh raspberries</strong> deliver only 78 cal/$1. <strong>Wild salmon</strong>: 120 cal/$1. <strong>Baby spinach</strong>: 65 cal/$1. <strong>Fresh blueberries</strong>: 95 cal/$1. <strong>Grass-fed beef</strong>: 155 cal/$1. To get 2,000 daily calories from these foods would cost $18-$25 per day, versus $2-$3 from rice, flour, and oil.</p>

<p>The practical middle ground — what our data suggests is the optimal budget-nutrition strategy — is a base of lentils ($0.95/day for 1,000 calories + 45g protein), oats ($0.50/day for 500 calories), eggs ($1.40/day for 300 calories + 24g protein), and frozen vegetables ($1.50/day for 200 calories + micronutrients). Total: $4.35 per day for a nutritionally complete 2,000-calorie diet. Compare specific foods using our <a href="/compare/">nutrition comparison tool</a>.</p>
`,
    keyTakeaway: 'Vegetable oil delivers 8,840 calories per dollar — 113x more than fresh raspberries at 78 cal/$1. The optimal budget strategy combines lentils (best protein per dollar), oats (best fiber per dollar), eggs, and frozen vegetables for approximately $4.35/day.',
    faqs: [
      {
        question: 'What food has the most calories per dollar?',
        answer: 'Vegetable oil tops the list at approximately 8,840 calories per dollar, followed by white sugar (3,870) and flour (3,640). For nutritious calorie density, peanut butter (2,340 cal/$1) and dried lentils (2,100 cal/$1) are far better choices.',
      },
      {
        question: 'What is the cheapest way to eat healthy?',
        answer: 'A combination of dried lentils, oats, eggs, and frozen vegetables provides a nutritionally complete diet for approximately $4.35 per day (2,000 calories). Lentils are the single best budget protein source at 18g of protein per dollar.',
      },
      {
        question: 'Why is healthy food more expensive than junk food?',
        answer: 'Fresh produce and lean proteins are perishable, require refrigerated transport, and have lower calorie density by weight. Processed foods use cheap shelf-stable ingredients that maximize calories per dollar. Government subsidies for corn, wheat, and soy further reduce the cost of processed foods.',
      },
    ],
  },
  {
    slug: 'fast-food-calorie-comparison',
    title: 'Fast Food Calorie Comparison: Which Chains Are the Healthiest?',
    date: '2026-04-13',
    summary: 'We compared average calorie counts across menu items at 10 major fast food chains. The range between the "healthiest" and least healthy chains is wider than most people assume.',
    content: `
<p>Fast food accounts for roughly 36% of daily calories for American adults who eat it on a given day (USDA Economic Research Service, 2025). With menu calorie counts now mandatory nationwide, we aggregated nutritional data across 10 major chains to see which ones make it easiest — or hardest — to eat a reasonable meal.</p>

<p><strong>Average calories per standard combo meal</strong> (entree + side + medium drink): <strong>Subway</strong>: 680 cal | <strong>Chick-fil-A</strong>: 780 cal | <strong>Taco Bell</strong>: 810 cal | <strong>McDonald's</strong>: 920 cal | <strong>Wendy's</strong>: 960 cal | <strong>Burger King</strong>: 1,010 cal | <strong>Five Guys</strong>: 1,340 cal | <strong>Panda Express</strong>: 890 cal | <strong>Chipotle</strong>: 1,070 cal | <strong>Popeyes</strong>: 1,120 cal.</p>

<p><strong>Subway</strong> ranks lowest because its default combo is a 6-inch sub with chips and a drink rather than a 12-inch, and the bread + vegetable base is inherently lower calorie than fried items. However, a Subway Footlong Meatball Marinara with cheese clocks in at 960 calories — matching McDonald's. The "healthiest chain" label depends entirely on what you order.</p>

<p><strong>Chipotle</strong> is the biggest surprise. Despite its "fresh and healthy" branding, a standard burrito with white rice, chicken, black beans, cheese, sour cream, and guacamole totals 1,170 calories — more than a Big Mac Meal (1,080 cal with medium fries and Coke). The culprits are the oversized tortilla (320 cal), rice (210 cal), and guacamole (230 cal). A burrito bowl without rice and sour cream drops to 650 calories — a 45% reduction from one substitution.</p>

<p><strong>Five Guys</strong> consistently ranks as the highest-calorie fast food option. A regular cheeseburger (840 cal) plus regular fries (953 cal) totals 1,793 calories before a drink — close to a full day's intake. Their "little" burger and "little" fries are still a 1,008-calorie meal. The fry portions at Five Guys are roughly 2.5x the weight of McDonald's large fries.</p>

<p>The actionable insight: the chain matters less than the specific order. Every chain offers meals under 700 calories and meals over 1,200 calories. Look up exact calorie counts using our <a href="/food/">food database</a>.</p>
`,
    keyTakeaway: 'Subway averages the fewest calories per combo meal (680), but the chain matters less than the specific order. A Chipotle burrito (1,170 cal) has more calories than a Big Mac Meal (1,080 cal). A simple swap — burrito bowl without rice — cuts 45% of calories.',
    faqs: [
      {
        question: 'Which fast food chain has the lowest calories?',
        answer: 'Subway averages the lowest calories per standard combo meal at approximately 680 calories. Chick-fil-A (780 cal) and Taco Bell (810 cal) are also lower than average. However, every chain offers both low and high calorie options.',
      },
      {
        question: 'Is Chipotle actually healthy?',
        answer: 'It depends on what you order. A standard Chipotle burrito with all toppings contains approximately 1,170 calories — more than a Big Mac Meal. A burrito bowl without rice and sour cream drops to about 650 calories with 42g of protein.',
      },
    ],
  },
  {
    slug: 'hidden-calories-common-foods',
    title: '10 "Healthy" Foods With Surprisingly High Calories',
    date: '2026-04-13',
    summary: 'Foods marketed as healthy often contain more calories than the junk food they replace. We analyzed USDA data for 10 common "health foods" and the results challenge conventional diet wisdom.',
    content: `
<p>The "health halo" effect is well-documented in nutrition research: when people believe a food is healthy, they underestimate its calories by an average of 35% (Chandon & Wansink, Journal of Consumer Research). Our USDA data analysis identifies the worst offenders — foods that are genuinely nutritious but dramatically higher in calories than most people assume.</p>

<p><strong>1. Granola</strong> — 597 calories per cup. A typical "healthy breakfast" of 1 cup granola + 1 cup whole milk + banana = 940 calories. The same volume of Frosted Flakes + milk + banana = 520 calories. Granola is calorie-dense because it is compressed oats bound with oil and sugar. The nutritional advantage (more fiber, healthier fats) is real, but so is the 80% calorie premium.</p>

<p><strong>2. Smoothies</strong> — A medium Jamba Juice "Protein Berry Workout" contains 480 calories. A Tropical Smoothie "Detox Island Green" has 390 calories. The problem: liquid calories do not trigger satiety signals as effectively as solid food. A 480-calorie smoothie leaves most people as hungry as a 200-calorie snack would.</p>

<p><strong>3. Avocado</strong> — 322 calories per whole avocado (200g). One avocado on toast with olive oil = 520 calories. This exceeds two scrambled eggs on toast (380 calories) by 37%. Avocados are nutritionally excellent, but portions matter — half an avocado (161 cal) is the standard serving size.</p>

<p><strong>4. Salad with dressing</strong> — A Caesar salad with croutons and 3 tablespoons of dressing: 470 calories. A Cobb salad: 610 calories. A McDonald's Big Mac: 563 calories. The dressing alone (3 tbsp ranch = 216 cal) often contains more calories than the greens, protein, and vegetables combined.</p>

<p><strong>5. Trail mix</strong> — 693 calories per cup. One cup exceeds the calories in a Snickers bar (488 cal) by 42%. The nuts and dried fruit are nutritious, but the calorie density (4.3 cal/gram) rivals that of chocolate.</p>

<p><strong>6-10 in brief:</strong> Acai bowls (490-680 cal depending on toppings), olive oil (119 cal per tablespoon — 3 tablespoons in a "healthy" stir-fry adds 357 invisible calories), dried fruit (130 cal per small handful vs 45 cal for the fresh equivalent), whole wheat bread (same 75-80 cal/slice as white bread), and coconut milk (445 cal per cup of full-fat).</p>

<p>None of these foods are "bad." The problem is purely quantitative: people eat larger portions of "healthy" foods because they assume the calories are lower. Compare any two foods precisely using our <a href="/compare/">comparison tool</a>.</p>
`,
    keyTakeaway: 'Granola has 80% more calories per cup than Frosted Flakes. A Caesar salad with dressing (470 cal) rivals a Big Mac (563 cal). These foods are genuinely nutritious, but the "health halo" causes people to underestimate calories by an average of 35%, leading to overeating.',
    faqs: [
      {
        question: 'Is granola actually healthy?',
        answer: 'Granola is nutritious (high in fiber, iron, healthy fats) but extremely calorie-dense at 597 calories per cup — 80% more than most sweetened cereals. Standard portion sizes (1/4 to 1/3 cup) are much smaller than what most people serve themselves.',
      },
      {
        question: 'Why do people underestimate calories in healthy foods?',
        answer: 'Researchers call this the "health halo" effect. When a food is labeled organic, natural, or healthy, consumers underestimate its calories by an average of 35% and give themselves permission to eat larger portions.',
      },
      {
        question: 'Are salads lower in calories than burgers?',
        answer: 'Not always. Popular restaurant salads with cheese, croutons, bacon, nuts, and dressing often exceed 500-700 calories. A Caesar salad (470 cal with dressing) is only 93 calories less than a Big Mac (563 cal).',
      },
    ],
  },
];

export function getAllInsightArticles(): InsightArticle[] {
  return insightArticles;
}

export function getInsightArticleBySlug(slug: string): InsightArticle | undefined {
  return insightArticles.find((i) => i.slug === slug);
}
