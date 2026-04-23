import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Methodology — How CalorieWize Builds Its Nutrition Data",
  description:
    "Exactly how CalorieWize sources its calorie and macro data — anchored in the USDA FoodData Central API and cross-referenced against the US Dietary Guidelines and FDA Daily Values.",
  alternates: { canonical: "/methodology/" },
  openGraph: { url: "/methodology/" },
};

export default function MethodologyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1>Our Methodology</h1>
      <p className="lead text-lg text-slate-600">
        Calorie counting and macro tracking drive real decisions about
        weight, performance, and long-term health. You deserve to know
        exactly where our numbers come from, how we compute them, and what
        they cannot tell you. CalorieWize is an information tool, not a
        medical reference &mdash; but the information should still be
        trustworthy.
      </p>

      <h2>Primary source: USDA FoodData Central</h2>
      <p>
        Every food entry on CalorieWize is built from the{" "}
        <a
          href="https://fdc.nal.usda.gov/"
          target="_blank"
          rel="noopener noreferrer"
        >
          USDA FoodData Central
        </a>{" "}
        API, the US Department of Agriculture&apos;s authoritative
        nutrient database. FoodData Central consolidates several datasets
        that most US nutrition researchers and dietitians rely on,
        including:
      </p>
      <ul>
        <li>
          <strong>Foundation Foods</strong> &mdash; lab-analyzed nutrient
          profiles for generic whole foods (apples, spinach, chicken
          breast), the gold standard for unbranded foods.
        </li>
        <li>
          <strong>Standard Reference (SR Legacy)</strong> &mdash; the
          long-running USDA reference database that has underpinned US
          nutrition analysis for decades.
        </li>
        <li>
          <strong>Branded Foods</strong> &mdash; product-specific data
          sourced from manufacturer submissions under the Global Data
          Synchronization Network.
        </li>
        <li>
          <strong>Survey (FNDDS)</strong> &mdash; the Food and Nutrient
          Database for Dietary Studies, used in national surveys like
          NHANES.
        </li>
      </ul>
      <p>
        FoodData Central data is released into the public domain (CC0),
        which is why you see it republished across nutrition apps, fitness
        software, and research papers.
      </p>

      <h2>What we publish per food</h2>
      <p>For each food we extract from FoodData Central:</p>
      <ul>
        <li>calories per 100 g serving (kcal),</li>
        <li>
          macronutrients: protein, total fat, saturated fat, total
          carbohydrates, fiber, and sugars,
        </li>
        <li>
          micronutrients where available: sodium, cholesterol, potassium,
          calcium, iron, and vitamin C,
        </li>
        <li>the canonical USDA FDC ID so you can cross-reference directly.</li>
      </ul>
      <p>
        Every food page on CalorieWize links out to the exact FoodData
        Central entry (by FDC ID) so you can verify the source numbers at
        the official USDA URL.
      </p>

      <h2>Daily Value percentages</h2>
      <p>
        When we display &ldquo;% Daily Value&rdquo; we use the reference
        values defined by the{" "}
        <a
          href="https://www.fda.gov/food/new-nutrition-facts-label/daily-value-new-nutrition-and-supplement-facts-labels"
          target="_blank"
          rel="noopener noreferrer"
        >
          FDA on the 2016 Nutrition Facts label update
        </a>{" "}
        (effective for most manufacturers since 2021). These are the same
        Daily Values you see on US food packaging. The figure is
        calibrated to a 2,000-calorie reference diet, which the FDA
        explicitly notes is a rough baseline, not a personal target.
      </p>

      <h2>Diet classification</h2>
      <p>
        Diet compatibility tags (keto, paleo, vegan, high-protein,
        low-carb, and so on) are derived deterministically from the
        macronutrient profile using widely-accepted thresholds:
      </p>
      <ul>
        <li>
          <strong>Keto</strong> &mdash; under roughly 10&thinsp;% of calories
          from carbohydrates.
        </li>
        <li>
          <strong>High protein</strong> &mdash; at least 15 g of protein per
          100 g (roughly 20&thinsp;% of calories from protein).
        </li>
        <li>
          <strong>Low calorie</strong> &mdash; under 100 kcal per 100 g.
        </li>
        <li>
          <strong>High fiber</strong> &mdash; at least 5 g fiber per 100 g.
        </li>
      </ul>
      <p>
        These thresholds are rough-and-ready. Whether a specific food
        &ldquo;fits&rdquo; a diet depends on the rest of your day, not on
        a binary tag.
      </p>

      <h2>Cross-reference and verification</h2>
      <p>
        We link every food page to authoritative references so you can
        double-check anything before relying on it for a real health
        decision:
      </p>
      <ul>
        <li>
          <a
            href="https://fdc.nal.usda.gov/"
            target="_blank"
            rel="noopener noreferrer"
          >
            USDA FoodData Central
          </a>{" "}
          &mdash; the primary nutrient database, with the exact FDC ID
          linked from every food page.
        </li>
        <li>
          <a
            href="https://www.dietaryguidelines.gov/"
            target="_blank"
            rel="noopener noreferrer"
          >
            US Dietary Guidelines
          </a>{" "}
          &mdash; the US Department of Health and Human Services /
          Agriculture official dietary recommendations, updated every 5
          years.
        </li>
        <li>
          <a
            href="https://ods.od.nih.gov/factsheets/list-all/"
            target="_blank"
            rel="noopener noreferrer"
          >
            NIH Office of Dietary Supplements
          </a>{" "}
          &mdash; authoritative fact sheets for specific nutrients (when
          you want to go deeper than the label).
        </li>
        <li>
          <a
            href="https://www.cdc.gov/nutrition/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CDC Nutrition
          </a>{" "}
          &mdash; US population-level nutrition data and public-health
          recommendations.
        </li>
      </ul>

      <h2>Update frequency</h2>
      <p>
        USDA FoodData Central updates continuously, with the largest
        releases happening several times per year as new branded products
        arrive and laboratory analyses complete. We refresh our cached
        snapshot regularly, and each food page shows the vintage of the
        underlying USDA data.
      </p>

      <h2>Limitations you should know about</h2>
      <ul>
        <li>
          <strong>Per 100 g serving.</strong> All of our numbers are
          normalized to 100 g for cross-food comparability. Your actual
          serving is probably different, so multiply accordingly.
        </li>
        <li>
          <strong>Preparation matters.</strong> Raw, boiled, baked, and
          fried versions of the same ingredient can have very different
          nutrient profiles. FoodData Central distinguishes these where
          possible, but your home preparation may differ.
        </li>
        <li>
          <strong>Branded products age.</strong> Manufacturers
          occasionally reformulate. For branded products, the packaging
          in front of you is more authoritative than any database snapshot.
        </li>
        <li>
          <strong>Daily Values are population averages.</strong> The 2,000
          kcal reference is a baseline for labeling, not a personal
          target. Use our TDEE calculator (or work with a dietitian) to
          get a number that actually applies to you.
        </li>
        <li>
          <strong>Not medical advice.</strong> Nothing on CalorieWize is a
          substitute for advice from a licensed dietitian, physician, or
          other qualified healthcare professional. For clinical nutrition
          decisions, work with someone who can see the rest of your
          picture.
        </li>
      </ul>

      <h2>Corrections and feedback</h2>
      <p>
        If you find a nutrient value that disagrees with the current USDA
        FoodData Central entry, please <a href="/contact">contact us</a>{" "}
        with the food name and the FDC ID. We refresh from USDA on a
        schedule, and your flag helps us prioritize.
      </p>

      <p className="text-sm text-slate-500 border-t pt-4 mt-8">
        This methodology page was last reviewed in March 2026. Material
        changes to how we source or compute the data will be reflected
        here before they reach production pages.
      </p>
    </article>
  );
}
