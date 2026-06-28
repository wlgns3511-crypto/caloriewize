import type { Metadata } from "next";
import Link from "next/link";
import { AuthorBox } from "@/components/AuthorBox";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Our Methodology — How CalorieWize Builds Its Nutrition Data",
  description:
    "Exactly how CalorieWize sources its calorie and macro data — anchored in the USDA FoodData Central API and cross-referenced against the FDA, NIH, US Dietary Guidelines, and CDC.",
  alternates: { canonical: "/methodology/" },
  openGraph: { url: "/methodology/" },
};

export default function MethodologyPage() {
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Methodology', url: '/methodology/' },
  ];

  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />

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
        <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer">
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
        <li>macronutrients: protein, total fat, saturated fat, total
          carbohydrates, fiber, and sugars,</li>
        <li>micronutrients where available: sodium, cholesterol, potassium,
          calcium, iron, and vitamin C,</li>
        <li>the canonical USDA FDC ID so you can cross-reference directly.</li>
      </ul>
      <p>
        Every food page on CalorieWize links out to the exact FoodData
        Central entry (by FDC ID) so you can verify the source numbers at
        the official USDA URL.
      </p>

      <h2>Site-specific levers</h2>
      <p>
        Beyond raw nutrient values, each food page surfaces four
        deterministic classifications. These are pure functions of the
        underlying USDA row and published reference values &mdash; same
        input, same output. Each classifier maps directly to its FDA /
        NIH / FAO source, and the lever identifiers are referenced
        directly on per-food pages so you can audit how a label was
        assigned.
      </p>
      <ol>
        <li>
          <strong>FDA Daily Value Tier</strong> (<code>classifyDvTier</code>) &mdash;
          per-nutrient %DV is bucketed using FDA&apos;s own labeling
          guidance: 5% or less = LOW, 5&ndash;20% = MODERATE, 20% or more
          = HIGH. Reference:{' '}
          <a href="https://www.fda.gov/food/new-nutrition-facts-label/daily-value-new-nutrition-and-supplement-facts-labels" target="_blank" rel="noopener noreferrer">FDA Daily Values</a>.
        </li>
        <li>
          <strong>Macro Profile Tags</strong> (<code>classifyMacroProfile</code>) &mdash;
          deterministic diet-compatibility tags from the per-100g macro
          profile. Keto: under ~10% calories from carbs. High-protein:
          &ge;15g protein per 100g. Low-calorie: under 100 kcal per 100g.
          High-fiber: &ge;5g per 100g (FDA &ldquo;high&rdquo; threshold).
          Low-sodium: under 140 mg per 100g (FDA labeling threshold).
        </li>
        <li>
          <strong>FAO DIAAS Protein Quality Tier</strong>{' '}
          (<code>classifyProteinQuality</code>) &mdash; protein quality
          per the Digestible Indispensable Amino Acid Score. FAO 2013
          bands: &ge;1.0 EXCELLENT (animal proteins, soy), 0.75&ndash;1.0
          GOOD (legume proteins like pea), &lt;0.75 LOWER (cereals, most
          plant foods alone). Mapped at the USDA category level using
          published FAO/WHO reference values.
        </li>
        <li>
          <strong>NOVA Processing Tier</strong> (<code>classifyNovaTier</code>) &mdash;
          processing classification per the Monteiro et al. NOVA system.
          Group 1 (unprocessed) for Foundation Foods and SR Legacy entries;
          Group 3 (processed) for FNDDS as-consumed mixed dishes; Group 4
          (ultra-processed) for Branded entries. We surface NOVA as a
          published-systematic label, not an opinion-driven verdict.
        </li>
      </ol>
      <p>
        We also surface an Atwater reconciliation tag
        (<code>reconcileAtwater</code>): whether a row&apos;s calorie value
        appears to use the general 4-9-4 factors (protein 4 cal/g, fat 9
        cal/g, carb 4 cal/g) or food-specific Atwater factors. The
        food-specific path is more accurate for nuts, fibrous foods, and
        high-fat items where digestibility differs from the general
        assumption.
      </p>

      <h2>Per-food and per-hub interpretation classifiers</h2>
      <p>
        Two further interpretation lenses run on top of the per-food
        row. Both are deterministic: they look at the food&apos;s USDA
        category, its per-100-g macro and micronutrient values, and the
        published threshold from a single primary authority. The four
        paragraph slots are computed by branching on (tier &times;
        standout nutrient &times; macro shape &times; FDC ID modulo) so
        each food row produces a distinct prose composition rather than
        a generic template.
      </p>
      <ol>
        <li>
          <strong>5-bucket dietary-fit lens</strong>{' '}
          (<code>classifyDietaryFits</code>) &mdash; per-100-g pattern
          fit for five published patterns. Each fit links to its primary
          authority:
          <ul>
            <li>
              <em>Mediterranean-style</em> &mdash;{' '}
              <a href="https://www.dietaryguidelines.gov/sites/default/files/2021-03/Dietary_Guidelines_for_Americans-2020-2025.pdf" target="_blank" rel="noopener noreferrer">
                USDA-HHS Dietary Guidelines for Americans 2020-2025, Appendix 2 Healthy Mediterranean-Style Pattern
              </a>{' '}
              (per-100-g proxied via FDA &le;1 g saturated fat).
            </li>
            <li>
              <em>Ketogenic-clinical</em> &mdash;{' '}
              <a href="https://www.ncbi.nlm.nih.gov/books/NBK499830/" target="_blank" rel="noopener noreferrer">
                NIH NCBI StatPearls Ketogenic Diet
              </a>{' '}
              (under 10 % of calories from carbohydrate, per 100 g).
            </li>
            <li>
              <em>Minimally-processed</em> &mdash;{' '}
              <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer">
                USDA FoodData Central
              </a>{' '}
              category mapped onto the{' '}
              <a href="https://pubmed.ncbi.nlm.nih.gov/30744710/" target="_blank" rel="noopener noreferrer">
                Monteiro 2019 NOVA Group 1/2
              </a>{' '}
              minimally-processed bands.
            </li>
            <li>
              <em>Low-sodium-FDA</em> &mdash;{' '}
              <a href="https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-101/subpart-D/section-101.61" target="_blank" rel="noopener noreferrer">
                FDA 21 CFR &sect;101.61 &ldquo;Low sodium&rdquo;
              </a>{' '}
              (&le;140 mg per reference amount).
            </li>
            <li>
              <em>DASH-style</em> &mdash;{' '}
              <a href="https://www.nhlbi.nih.gov/files/docs/public/heart/dash_brief.pdf" target="_blank" rel="noopener noreferrer">
                NIH NHLBI DASH Eating Plan (NIH Pub. 06-4082)
              </a>{' '}
              (per-100-g proxied via FDA &le;1 g saturated fat and &le;140 mg sodium for DASH-eligible categories).
            </li>
          </ul>
        </li>
        <li>
          <strong>6-tier food category classifier</strong>{' '}
          (<code>classifyFoodCategory</code>) &mdash; rule-based per-row
          tier from the USDA category and per-100-g macro / standout
          nutrient: <code>staple-energy</code> (carb-dominant whole
          foods), <code>lean-protein</code> (&ge;15 g protein and &le;5
          g fat per 100 g), <code>micronutrient-dense</code> (under 50
          kcal with three or more nutrients at &ge;20 % FDA Daily
          Value), <code>processed-convenience</code> (Branded /
          NOVA-Group-4 entries), <code>discretionary</code> (&ge;500
          kcal, &ge;25 g sugar, or fats-and-oils category), and{' '}
          <code>niche-specialty</code> (default for everything else).
          The tier label sets the tone of the per-food interpretation
          strip.
        </li>
        <li>
          <strong>4-paragraph reader-help strip</strong>{' '}
          (<code>interpretFood</code>) &mdash; on per-food pages, four
          slots branch on (tier &times; standout nutrient &times; macro
          shape &times; category cluster): how to read the %DV column,
          common misreadings of the row, what the row does not capture
          (cooking method, brand variance, bioavailability), and a
          descriptive practical-use paragraph that respects the food&apos;s
          dietary-fit set. On the five hub pages
          (<code>list/[type]</code>, <code>category/[slug]</code>,{' '}
          <code>state/[slug]</code>, <code>food/</code>, <code>list/</code>),
          the same four slots adapt to the hub&apos;s primary axis.
        </li>
      </ol>

      <h2>Daily Value percentages</h2>
      <p>
        When we display &ldquo;% Daily Value&rdquo; we use the reference
        values defined by the{' '}
        <a href="https://www.fda.gov/food/new-nutrition-facts-label/daily-value-new-nutrition-and-supplement-facts-labels" target="_blank" rel="noopener noreferrer">
          FDA on the 2016 Nutrition Facts label update
        </a>{' '}
        (effective for most manufacturers since 2021). These are the same
        Daily Values you see on US food packaging. The figure is
        calibrated to a 2,000-calorie reference diet, which the FDA
        explicitly notes is a rough baseline, not a personal target.
      </p>

      <h2>Cross-reference and verification</h2>
      <p>
        We link every food page to authoritative references so you can
        double-check anything before relying on it for a real health
        decision:
      </p>
      <ul>
        <li>
          <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer">USDA FoodData Central</a>{' '}
          &mdash; the primary nutrient database, with the exact FDC ID
          linked from every food page.
        </li>
        <li>
          <a href="https://www.dietaryguidelines.gov/" target="_blank" rel="noopener noreferrer">US Dietary Guidelines</a>{' '}
          &mdash; the joint USDA / HHS dietary recommendations, updated
          every five years.
        </li>
        <li>
          <a href="https://ods.od.nih.gov/factsheets/list-all/" target="_blank" rel="noopener noreferrer">NIH Office of Dietary Supplements</a>{' '}
          &mdash; authoritative fact sheets for individual nutrients.
        </li>
        <li>
          <a href="https://www.cdc.gov/nutrition/" target="_blank" rel="noopener noreferrer">CDC Nutrition</a>{' '}
          &mdash; US population-level nutrition data and public-health
          recommendations.
        </li>
      </ul>

      <h2>Data vintage and editorial review</h2>
      <p>
        Each food page surfaces two distinct dates. The data vintage is
        the date of our last USDA sync. The editorial review date is when
        the page template, methodology language, or a derived classifier
        last changed. The two are deliberately separate so a methodology
        update does not falsely refresh data vintage, and a USDA sync does
        not overwrite the review date.
      </p>

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
          <strong>Per 100 g serving.</strong> All numbers are normalized
          to 100 g for cross-food comparability. Your actual serving is
          probably different, so multiply accordingly.
        </li>
        <li>
          <strong>Preparation matters.</strong> Raw, boiled, baked, and
          fried versions of the same ingredient have very different
          nutrient profiles. FoodData Central distinguishes these where
          possible, but your home preparation may differ.
        </li>
        <li>
          <strong>Branded products age.</strong> Manufacturers
          occasionally reformulate. For branded products, the packaging
          in front of you is more authoritative than any database
          snapshot.
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
        FoodData Central entry, see our{' '}
        <Link href="/corrections-policy/">corrections policy</Link> for the
        full path. Material corrections trigger a bumped reviewed date so
        the change is visible.
      </p>

      <AuthorBox layer="methodology" />
    </article>
  );
}
