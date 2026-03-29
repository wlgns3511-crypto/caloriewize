export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  readingTime: number;
  content: string;
}

const posts: BlogPost[] = [
  {
    slug: "how-to-count-calories-effectively",
    title: "How to Count Calories for Weight Loss (The Right Way)",
    description:
      "Calorie counting works — research consistently shows people who track intake lose twice as much weight. Here's how to do it accurately without obsessing over every number.",
    publishedAt: "2024-10-15",
    updatedAt: "2025-01-10",
    category: "Nutrition Basics",
    readingTime: 7,
    content: `
<h2>Why Calorie Counting Works (The Research)</h2>
<p>A comprehensive meta-analysis published in the Journal of the Academy of Nutrition and Dietetics found that people who consistently track their food intake lose <strong>twice as much weight</strong> as those who don't. The mechanism is simple: tracking creates awareness of actual intake, which most people consistently underestimate by 20–40%.</p>

<h2>Step 1: Calculate Your TDEE</h2>
<p>Your Total Daily Energy Expenditure (TDEE) is the number of calories you burn per day. It's based on your Basal Metabolic Rate (BMR) — the calories you'd burn at complete rest — multiplied by an activity factor:</p>
<ul>
  <li><strong>BMR calculation (Mifflin-St Jeor)</strong>: Men: (10 × weight in kg) + (6.25 × height in cm) − (5 × age) + 5. Women: same minus 161</li>
  <li><strong>Activity multipliers</strong>: Sedentary (1.2×), lightly active (1.375×), moderately active (1.55×), very active (1.725×)</li>
</ul>
<p>Example: A 35-year-old woman, 165 cm, 70 kg, lightly active has a BMR of ~1,478 and a TDEE of ~2,032 calories/day.</p>

<h2>Step 2: Create the Right Deficit</h2>
<p>The classic formula: a 500 calorie/day deficit creates approximately 1 lb of weight loss per week (3,500 calories = 1 lb of fat). This is an approximation, not a perfect equation, but it's a useful starting point.</p>
<p>For sustainable loss:</p>
<ul>
  <li><strong>Conservative (0.5 lb/week)</strong>: 250 cal/day deficit. Very sustainable, minimal hunger.</li>
  <li><strong>Moderate (1 lb/week)</strong>: 500 cal/day deficit. The most commonly recommended approach.</li>
  <li><strong>Aggressive (1.5–2 lb/week)</strong>: 750–1,000 cal/day deficit. Harder to sustain; risks muscle loss without adequate protein.</li>
</ul>
<p>Avoid going below 1,200 calories/day (women) or 1,500 calories/day (men) without medical supervision — severe restriction triggers metabolic adaptation and makes maintenance much harder.</p>

<h2>Common Underestimation Mistakes</h2>
<h3>Cooking Oils Are Invisible Calories</h3>
<p>A tablespoon of olive oil is 120 calories. If you're sautéing vegetables "lightly" in 2 tbsp of oil, you've just added 240 calories you probably didn't count. Oils are the most commonly missed food in food logs.</p>

<h3>Sauces and Condiments</h3>
<p>Two tablespoons of Caesar dressing: 160 calories. A packet of peanut sauce at a restaurant: 200–300 calories. A tablespoon of tahini: 90 calories. These add up invisibly, especially in restaurant meals.</p>

<h3>Restaurant Portions</h3>
<p>Studies show people underestimate restaurant meal calories by an average of 175–500 calories per meal. A "grilled chicken salad" at a chain restaurant may contain 800–1,200 calories with dressing — far more than the "healthy" perception suggests.</p>

<h2>Food Scale vs. Measuring Cups</h2>
<p>A food scale is significantly more accurate than measuring cups for calorie counting. "A cup of granola" measured in a measuring cup can range from 110–180 grams depending on how you fill the cup — a 60% variation. A food scale eliminates this ambiguity entirely. A basic kitchen scale costs $10–$15.</p>

<h2>Sustainable vs. Crash Deficit</h2>
<p>Very large deficits (more than 1,000 calories/day below TDEE) typically result in muscle loss alongside fat loss, metabolic adaptation (your TDEE decreases), micronutrient deficiencies, and poor adherence. Research shows that people who lose weight slowly (0.5–1 lb/week) are more likely to maintain their loss 2 years later than those who lose quickly. The goal is sustainable behavior change, not the fastest possible scale movement.</p>
`,
  },
  {
    slug: "highest-calorie-foods-ranked",
    title: "Highest Calorie Foods: The Numbers That Will Surprise You",
    description:
      "Some foods pack far more calories than you'd expect — and often in very small portions. Here are the calorie density numbers that catch people off guard.",
    publishedAt: "2024-10-28",
    category: "Food Data",
    readingTime: 5,
    content: `
<h2>Calorie Density: The Concept That Changes Everything</h2>
<p>Calorie density is calories per gram (or per ounce) of food. Foods with very high calorie density provide many calories in small portions — making it easy to dramatically overconsume without feeling full. The range is wide: lettuce (1.5 cal/g) vs. oil (9 cal/g), a 6x difference.</p>

<h2>The Highest Calorie Density Foods</h2>
<h3>Oils and Fats: 9 Calories Per Gram</h3>
<p>Pure fats and oils top the calorie density chart, and they're found in nearly every meal. Olive oil, coconut oil, butter, lard — all contain approximately 120 calories per tablespoon. At 9 cal/g, fat is more than twice as dense as protein or carbohydrates (both 4 cal/g). This doesn't make fat "bad" — it just means portions matter.</p>

<h3>Nuts and Nut Butters: 5.5–7 Calories Per Gram</h3>
<p>A single ounce of almonds (about 23 nuts) contains 164 calories. Two tablespoons of peanut butter: 190 calories. Easy to underestimate because portions look small but add up quickly. The classic "healthy snack" of a handful of mixed nuts can be 200–400 calories depending on what "handful" means.</p>

<h3>Cheese: 3.5–4.5 Calories Per Gram</h3>
<p>An ounce of cheddar cheese contains about 113 calories. "Just a little cheese" on a salad or pasta can add 200–300 calories if not portioned carefully. Cream cheese and mascarpone are particularly dense at 4–5 cal/g.</p>

<h3>Chocolate: 5–6 Calories Per Gram</h3>
<p>A single square of dark chocolate (about 10g) contains 50–60 calories. A standard chocolate bar (40g) can be 200–250 calories. "Just a little chocolate" as an after-dinner treat is often 150–300 calories.</p>

<h2>Restaurant Meals: Where Calorie Density Goes Extreme</h2>
<p>Restaurant meals combine multiple high-calorie-density ingredients with large portions. Some examples (from major chains' nutrition disclosures):</p>
<ul>
  <li><strong>Cheesecake Factory Pasta Carbonara</strong>: 2,090 calories</li>
  <li><strong>Applebee's Fiesta Lime Chicken</strong>: 1,290 calories (described as a lighter option)</li>
  <li><strong>McDonald's Large McFlurry</strong>: 690 calories</li>
  <li><strong>Starbucks Venti Caramel Frappuccino</strong>: 510 calories</li>
  <li><strong>Typical sit-down restaurant entree</strong>: 800–1,400 calories on average</li>
</ul>

<h2>Coffee Drinks: The Sneaky Calories</h2>
<p>Plain black coffee has essentially zero calories. But specialty coffee drinks can pack 300–800 calories with cream, sugar, syrups, and flavored additions. A daily large flavored latte can add 100,000+ calories per year — equivalent to about 28 pounds of body fat if not accounted for in your budget.</p>

<h2>Salad Dressings</h2>
<p>Salads are often perceived as diet food, but dressing changes the equation dramatically. Two tablespoons of ranch dressing: 145 calories. Caesar dressing: 160 calories. Blue cheese: 154 calories. Restaurant "side salads" with full dressing can exceed 400 calories. Using dressing on the side and dipping — rather than pouring — typically cuts dressing consumption by 50–70%.</p>

<h2>Using Calorie Density in Your Favor</h2>
<p>Volume eating uses the inverse concept: fill your plate with low-calorie-density foods (vegetables, fruits, broth-based soups, lean proteins) that provide large portions for few calories. This approach lets you eat large, satisfying meals while maintaining a calorie deficit.</p>
`,
  },
  {
    slug: "low-calorie-filling-foods",
    title: "Low Calorie Foods That Actually Keep You Full",
    description:
      "Not all low-calorie foods are created equal. These picks are low in calories but high in volume, protein, or fiber — meaning they actually satisfy hunger rather than leaving you counting the minutes to your next meal.",
    publishedAt: "2024-11-05",
    category: "Nutrition Guides",
    readingTime: 6,
    content: `
<h2>The Volume Eating Strategy</h2>
<p>Volume eating is the practice of prioritizing foods with low calorie density — lots of food for few calories. The principle: your stomach has stretch receptors that signal satiety based partly on how much space food takes up. Low calorie density foods fill the stomach with few calories, triggering satiety before you've overconsumed.</p>
<p>Calorie density comparison: 500 calories of chocolate (about 85g) vs. 500 calories of strawberries (about 833g). The strawberries fill your stomach 10 times as much.</p>

<h2>Top Low-Calorie, High-Satiety Foods</h2>

<h3>Broth-Based Soups</h3>
<p>Studies from Penn State show that eating soup before a meal reduces overall meal calorie intake by 20%. A large bowl of vegetable broth with vegetables is 100–150 calories and takes up significant stomach space. The liquid component expands the stomach volume and the warmth slows eating pace, allowing satiety signals to catch up.</p>

<h3>Leafy Greens</h3>
<p>Spinach, arugula, romaine, and kale contain 5–20 calories per cup. A massive salad base of 3–4 cups of greens is 30–60 calories before toppings. The volume and the chewing time both contribute to satiety. Add cucumber, peppers, and tomatoes to maintain volume without significantly adding calories.</p>

<h3>Watermelon and Other High-Water Fruits</h3>
<p>Watermelon is 92% water and contains only 46 calories per cup. Strawberries, cantaloupe, and grapefruit are similarly low in calorie density. The water content adds volume and the natural sugars provide a satisfying sweet flavor. These make excellent dessert substitutes.</p>

<h3>Air-Popped Popcorn</h3>
<p>Three cups of air-popped popcorn contains only 93 calories — yet it takes significant time to eat and fills the stomach with volume. It's one of the few snack foods that's simultaneously low-calorie and physically large. Watch out for the microwave varieties with butter and oil, which can be 400+ calories for the same quantity.</p>

<h3>Greek Yogurt (Plain, Non-Fat)</h3>
<p>A 200g serving of plain non-fat Greek yogurt contains about 130 calories and 22g of protein — making it one of the most nutrient-dense low-calorie foods available. Protein has the highest satiety per calorie of any macronutrient. Add berries for sweetness while keeping calories reasonable.</p>

<h3>Egg Whites</h3>
<p>Three egg whites: 51 calories, 11g protein. They can be cooked into a filling omelet with vegetables for a 150–200 calorie breakfast that satisfies for hours. The protein content is the key driver of satiety here.</p>

<h2>Protein: The Satiety Superstar</h2>
<p>Protein is significantly more satiating per calorie than carbohydrates or fat. Studies show high-protein diets lead people to naturally eat 400–600 fewer calories per day without conscious restriction. Prioritizing protein (chicken breast, fish, legumes, Greek yogurt, egg whites) at each meal is one of the most effective evidence-based strategies for reducing hunger while losing weight.</p>

<h2>Fiber's Role</h2>
<p>Soluble fiber (found in oats, beans, apples, and psyllium husk) absorbs water and forms a gel in your digestive tract, slowing gastric emptying and prolonging satiety. Studies show 14g additional fiber per day is associated with 10% reduced calorie intake. Beans are particularly effective: high in fiber, high in protein, moderate calories, and very filling.</p>

<h2>Sample 400-Calorie Meals</h2>
<ul>
  <li><strong>Breakfast</strong>: 3 egg whites + 1 whole egg scrambled with spinach, mushrooms, and peppers + 1 cup berries = ~380 calories</li>
  <li><strong>Lunch</strong>: Large salad (4 cups greens, cucumbers, tomatoes, chickpeas, 2 tbsp light dressing) + 4 oz grilled chicken = ~395 calories</li>
  <li><strong>Dinner</strong>: Large bowl of vegetable soup with 1 cup white beans + side salad = ~380 calories</li>
</ul>
`,
  },
  {
    slug: "calorie-deficit-explained",
    title: "Calorie Deficit: The Math Behind Weight Loss (And Why It's Not Always 3,500 Cal)",
    description:
      "The classic '3,500 calories = 1 pound' rule is a useful approximation — but it oversimplifies what actually happens in your body. Here's the real science.",
    publishedAt: "2024-11-20",
    category: "Nutrition Science",
    readingTime: 7,
    content: `
<h2>The Classic Rule and Its Limits</h2>
<p>The "3,500 calorie = 1 pound of fat" rule has been used in nutrition education for decades. It derives from the caloric content of pure fat tissue (approximately 3,500 calories per pound). If you maintain a 500-calorie daily deficit, the math predicts you'll lose 1 lb per week. In the short term, this approximation works reasonably well. Over longer periods, it breaks down.</p>

<h2>Metabolic Adaptation: Your Body Fights Back</h2>
<p>When you create a calorie deficit, your body responds in several ways that reduce your TDEE:</p>
<ul>
  <li><strong>Reduced body weight</strong>: A lighter body burns fewer calories at rest and during activity — this alone accounts for much of the adaptation</li>
  <li><strong>Reduced spontaneous activity</strong>: You unconsciously move less (fidgeting, posture adjustments, NEAT — non-exercise activity thermogenesis)</li>
  <li><strong>Hormonal changes</strong>: Leptin (satiety hormone) drops; ghrelin (hunger hormone) increases; thyroid hormones may decrease</li>
  <li><strong>Adaptive thermogenesis</strong>: A metabolic slowdown beyond what body weight alone predicts, studied extensively by researcher Kevin Hall</li>
</ul>
<p>Hall's research shows that after significant weight loss, people burn 200–500 fewer calories per day than a weight-matched person who was never heavier. This "metabolic adaptation" persists long-term and is a significant reason why weight maintenance is harder than initial loss.</p>

<h2>Set Point Theory</h2>
<p>Set point theory proposes that your body defends a particular weight range through hormonal feedback mechanisms. This explains why weight often plateaus at specific levels, and why returning to pre-diet habits causes rapid weight regain toward the original weight. The set point can be shifted over time — but it requires sustained behavioral change, not just a temporary diet.</p>

<h2>Why Linear Models Fail at Extremes</h2>
<p>If a 500 cal/day deficit = 1 lb/week, a 1,000 cal/day deficit should produce 2 lb/week indefinitely. In practice:</p>
<ul>
  <li>Large deficits cause proportionally more lean mass loss (not just fat)</li>
  <li>Metabolic adaptation is larger with larger deficits</li>
  <li>Hunger becomes severe, making adherence difficult</li>
  <li>Micronutrient needs become harder to meet</li>
</ul>
<p>A 2019 study in Obesity Reviews confirmed that even people adhering to very low calorie diets achieve less weight loss than simple arithmetic predicts due to these adaptive responses.</p>

<h2>What Research Actually Shows Is Realistic</h2>
<p>Comprehensive reviews of weight loss interventions show:</p>
<ul>
  <li><strong>1–1.5 lbs/week</strong> is achievable and maintainable for most people</li>
  <li><strong>0.5 lb/week</strong> is more sustainable long-term with less metabolic adaptation</li>
  <li>Weight loss plateaus are normal and expected — not signs of failure</li>
  <li>The initial rate of loss slows as body weight decreases (less weight = lower TDEE)</li>
</ul>

<h2>The Importance of Protein</h2>
<p>In a calorie deficit, your body gets energy from both fat and muscle. Eating adequate protein (0.7–1g per pound of body weight) while in a deficit minimizes muscle loss. This matters because muscle tissue is metabolically active — losing muscle reduces your TDEE, making future maintenance harder. High protein also directly reduces hunger through satiety hormones (GLP-1, PYY, CCK).</p>

<h2>Deficit Maintenance vs. Continuous Deficit</h2>
<p>Some research suggests that <strong>"diet breaks"</strong> — returning to maintenance calories for 1–2 weeks every 8–12 weeks — can partially mitigate adaptive thermogenesis and improve long-term adherence. The CALERIE study found participants who alternated between deficit and maintenance periods lost similar amounts of fat but with less lean mass loss and metabolic adaptation than those in continuous deficit. This approach may make the overall weight loss journey more sustainable for many people.</p>
`,
  },
  {
    slug: "restaurant-calorie-counts-shocking",
    title: "Restaurant Calorie Counts: Shocking Numbers You Need to Know",
    description:
      "FDA menu labeling now requires chains to post calories — and the numbers are often shocking. Here's what the data reveals about eating out, and strategies for managing it.",
    publishedAt: "2024-12-05",
    category: "Food Data",
    readingTime: 5,
    content: `
<h2>FDA Menu Labeling Law</h2>
<p>Since 2018, the FDA has required chain restaurants with 20+ locations to display calorie counts on their menus. This applies to fast food, sit-down restaurants, coffee shops, bakeries, and even movie theater concessions. The intent was to help consumers make informed choices — and research shows it has modestly reduced average calorie ordering at some chains.</p>

<h2>The Biggest Offenders (Major Chains)</h2>
<p>These menu items are legally required to show calorie counts — and the numbers are eye-opening:</p>
<table>
  <thead><tr><th>Item</th><th>Calories</th></tr></thead>
  <tbody>
    <tr><td>Cheesecake Factory Bistro Shrimp Pasta</td><td>3,120</td></tr>
    <tr><td>Applebee's Neighborhood Nachos with Chicken</td><td>1,780</td></tr>
    <tr><td>IHOP Country Fried Steak &amp; Eggs</td><td>1,760</td></tr>
    <tr><td>Olive Garden Tour of Italy</td><td>1,570</td></tr>
    <tr><td>McDonald's Large McFlurry (Oreo)</td><td>690</td></tr>
    <tr><td>Starbucks Venti Caramel Frappuccino w/ whip</td><td>510</td></tr>
    <tr><td>Chili's Classic Bacon Burger (no fries)</td><td>1,080</td></tr>
  </tbody>
</table>
<p>These numbers represent a single meal item — not including appetizers, sides, drinks, or dessert. A full dinner at a sit-down chain can easily total 2,500–4,000 calories.</p>

<h2>Chain vs. Independent Restaurants</h2>
<p>Chain restaurants must post calorie counts; independent restaurants don't. Research consistently shows that independent restaurant meals are often <strong>higher in calories</strong> than equivalent chain meals — without the consumer having any information to act on. A pasta dish at a local Italian restaurant may contain 1,800–2,500 calories with no disclosure requirement. The absence of calorie posting at independents is where the most significant calorie underestimation occurs.</p>

<h2>"Healthy" Menu Items That Aren't</h2>
<p>The perception of health doesn't always match the calorie reality:</p>
<ul>
  <li><strong>Panera Bread Chipotle Chicken Avocado Melt</strong>: 780 calories</li>
  <li><strong>Sweetgreen Harvest Bowl</strong>: 705 calories (before any additions)</li>
  <li><strong>Jamba Juice Acai Primo Bowl</strong>: 520 calories</li>
  <li><strong>Starbucks Protein Bistro Box</strong>: 490 calories</li>
  <li><strong>Tropical Smoothie Cafe Avocolada Smoothie</strong>: 740 calories</li>
</ul>
<p>Items marketed with words like "fresh," "natural," "harvest," or "artisan" carry no caloric implications — they're marketing language, not nutrition claims.</p>

<h2>Strategies for Eating Out While Tracking</h2>
<h3>Look Up Before You Go</h3>
<p>Major chain nutrition information is available on their websites and in calorie tracking apps like MyFitnessPal. Pre-logging your meal before you order helps you make informed choices before you're hungry and tempted.</p>

<h3>Ask for Modifications</h3>
<p>Dressing on the side (saves 100–200 calories), sauce on the side, no croutons, grilled instead of fried — these modifications can reduce a meal by 300–600 calories without significantly changing the experience. Restaurants are generally happy to accommodate.</p>

<h3>The Half-and-Half Strategy</h3>
<p>Restaurant portions are notoriously oversized. Immediately boxing half your entree when it arrives (before you start eating) has been shown to reduce calorie intake by 30–40% compared to leaving it accessible throughout the meal. Treat the boxed portion as tomorrow's lunch — you're getting two meals for the price of one.</p>

<h3>Strategic Calorie Budgeting</h3>
<p>If you know you're eating out for dinner, budget accordingly during the day. Eating light at breakfast and lunch (saving 500–700 calories) creates room in your daily budget for a restaurant meal without blowing your weekly deficit.</p>
`,
  },
];

export function getAllPosts(): BlogPost[] {
  return posts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(posts.map((p) => p.category)));
}
