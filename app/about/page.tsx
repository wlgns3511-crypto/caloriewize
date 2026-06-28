import type { Metadata } from "next";
import Link from "next/link";
import { CrossSiteLinks } from "@/components/CrossSiteLinks";
import { AuthorBox } from "@/components/AuthorBox";
import { breadcrumbSchema } from "@/lib/schema";

const desc = "About CalorieWize — free per-100g nutrition data for thousands of foods, sourced from the USDA FoodData Central API and classified against FDA Daily Value tiers, FAO/WHO DIAAS protein quality, NOVA processing groups, and NIH ODS reference frameworks.";

export const metadata: Metadata = {
  title: "About CalorieWize",
  description: desc,
  alternates: { canonical: "/about/" },
  openGraph: { title: "About CalorieWize", description: desc, url: "/about/" },
};

export default function AboutPage() {
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'About', url: '/about/' },
  ];

  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'WebPage', name: 'About CalorieWize',
        description: desc, url: 'https://caloriewize.com/about/',
        isPartOf: { '@type': 'WebSite', name: 'CalorieWize', url: 'https://caloriewize.com' },
      }) }} />

      <h1>About CalorieWize</h1>

      <p>
        CalorieWize publishes per-100g nutrition data for thousands of US-relevant foods. Every food entry on the site
        is built from a row in the US Department of Agriculture FoodData Central (USDA FDC) API &mdash; the
        public-domain (CC0) database maintained by USDA Agricultural Research Service that underpins virtually every
        US nutrition researcher, Registered Dietitian Nutritionist (RDN), and consumer tracking app. We add
        deterministic classifications &mdash; FDA-aligned Daily Value tiers (21 CFR &sect; 101.9), FAO/WHO DIAAS
        protein-quality tiers (2013 FAO Expert Consultation), and NOVA processing groups (Monteiro et al., adopted in
        FAO documents) &mdash; and clear labeling of the USDA data vintage, but the underlying numeric values are the
        USDA FDC row, unchanged.
      </p>

      <h2>What this site does</h2>
      <p>
        Each <Link href="/food/">food page</Link> shows the USDA-reported calories, macronutrients (protein, fat,
        carbohydrates, fiber, sugars), and key micronutrients (sodium, potassium, calcium, iron, vitamin C,
        cholesterol) for one specific USDA FDC entry, normalized to a 100g serving for cross-food comparability under
        the FDA Reference Amount Customarily Consumed (RACC) convention. Every page links out to the exact USDA FDC
        ID at fdc.nal.usda.gov so the source is one click away. Beyond per-food lookups, the site offers diet-tier
        {' '}<Link href="/list/">lists</Link> (low-calorie, high-protein, high-fiber, etc.), USDA-category
        {' '}<Link href="/category/">rollups</Link>, side-by-side <Link href="/compare/">food comparisons</Link>, a
        {' '}<Link href="/calculator/">TDEE / macro calculator</Link> built against the Mifflin-St Jeor equation and
        cross-referenced to NIH ODS guidance, evergreen guides covering USDA / FDA / FAO
        methodology, and <Link href="/insights/">insights</Link> articles on Nutrition Facts label-reading, USDA FDC
        data lineage, and practical tracking advice grounded in CDC and NIH ODS public guidance.
      </p>

      <h2>Composite read on every food page</h2>
      <p>
        Each food page surfaces a composite four-paragraph verdict driven by five deterministic levers anchored to USDA,
        FDA, FAO/WHO, and NIH ODS releases:
      </p>
      <ol>
        <li>
          <strong>FDA Daily Value tier (DvTier)</strong> &mdash; per-nutrient classification using the FDA 5% / 20%
          convention against the FDA Daily Values codified at 21 CFR &sect; 101.9, anchored to the FDA 2,000-calorie
          reference diet.
        </li>
        <li>
          <strong>Macronutrient profile (MacroProfile)</strong> &mdash; share of energy from USDA-reported protein, fat,
          and carbohydrate using the Atwater general factors (USDA Agriculture Handbook 74). Cross-checked against the
          USDA-reported energy value for analytical consistency.
        </li>
        <li>
          <strong>FAO/WHO DIAAS protein quality</strong> &mdash; protein-quality tier per the 2013 FAO Expert
          Consultation on Protein Quality, with the FAO/WHO reference amino-acid scoring pattern. Distinct from the
          older FAO/WHO PDCAAS method that FDA still references in some labeling contexts.
        </li>
        <li>
          <strong>NOVA processing tier</strong> &mdash; four-group processing classification per Monteiro et al. (BMJ,
          2018) and FAO documents on ultra-processed foods. Independent of nutrient density.
        </li>
        <li>
          <strong>Atwater reconciliation</strong> &mdash; reconstructed kcal (protein &times; 4 + fat &times; 9 + carb
          &times; 4 + alcohol &times; 7) vs USDA-reported energy. Surfaces the gap between USDA specific-factor
          arithmetic and the general 4/4/9 arithmetic used on every US Nutrition Facts label.
        </li>
      </ol>

      <h2>USDA FoodData Central data lineage</h2>
      <p>
        USDA FoodData Central consolidates several USDA-maintained datasets, each with distinct provenance:
      </p>
      <ul>
        <li>
          <strong>USDA Foundation Foods</strong> &mdash; laboratory-analyzed nutrient profiles for generic whole foods,
          maintained by USDA Agricultural Research Service. The most rigorous USDA data type; smallest in scope.
        </li>
        <li>
          <strong>USDA SR Legacy (Standard Reference)</strong> &mdash; the long-standing USDA reference database
          underpinning US nutrition analysis since the 1990s; ~7,800 foods with up to 150 nutrients per food.
        </li>
        <li>
          <strong>USDA FNDDS (Food and Nutrient Database for Dietary Studies)</strong> &mdash; survey-grade composition
          data used in CDC NHANES and other federal nutrition surveys.
        </li>
        <li>
          <strong>USDA Branded Foods</strong> &mdash; manufacturer-submitted product data via the Global Data
          Synchronization Network. Reflects what is on the FDA-mandated Nutrition Facts label.
        </li>
      </ul>
      <p>
        Each CalorieWize food page identifies which USDA data type the row came from. We do not blend, average, or
        proprietarily &ldquo;score&rdquo; values across USDA data types.
      </p>

      <h2>What this site is not</h2>
      <ul>
        <li>
          <strong>Not medical or dietary advice (YMYL).</strong> Nutrition is a Your-Money-or-Your-Life topic. Nothing
          on CalorieWize substitutes for advice from a Registered Dietitian Nutritionist (RDN), licensed physician, or
          other qualified healthcare professional. Individual dietary needs depend on health status, medications,
          allergies, and goals that no public USDA, FDA, NIH ODS, or CDC database can know about.
        </li>
        <li>
          <strong>Not a real-time USDA mirror.</strong> USDA refreshes FoodData Central continuously; CalorieWize syncs
          periodically. Page data reflects the last USDA sync, labeled as the data vintage. The USDA vintage and the
          CalorieWize editorial-review date are distinct on each page.
        </li>
        <li>
          <strong>Not a brand-product authority.</strong> USDA Branded Foods entries reflect manufacturer submissions.
          Product reformulations occasionally make the FDA Nutrition Facts label drift from the USDA FDC entry. When
          in doubt, the FDA-mandated package label in front of the reader is more authoritative than any database.
        </li>
        <li>
          <strong>Not a proprietary &ldquo;health score.&rdquo;</strong> Composite proprietary scores collapse multiple
          independent dimensions into a single number that obscures USDA, FDA, FAO/WHO, and NIH ODS tradeoffs. We
          surface the underlying USDA / FDA / FAO/WHO / NOVA classifications instead.
        </li>
      </ul>

      <h2>Editorial structure</h2>
      <p>
        Methodology pages, USDA-derived rollups, and guide content are reviewed by the CalorieWize Editorial Team
        before publication, with cross-reference to the USDA Agricultural Research Service, the FDA Center for Food
        Safety and Applied Nutrition (CFSAN), NIH ODS fact sheets, CDC NHANES documentation, and the FAO/WHO 2013
        DIAAS expert consultation. Per-food pages are template-driven and reflect the USDA FoodData Central source row
        as ingested; the Editorial Team reviews the template, the classifier code, and the underlying USDA
        calculations &mdash; not every individual page. Material changes to the page template, USDA-derived calculation
        methods, or FDA-tier / DIAAS-tier classifier thresholds bump the editorial review date so the change is
        visible in the AuthorBox alongside the USDA data vintage.
      </p>
      <p>
        See our <Link href="/editorial-policy/">editorial policy</Link> for the full standards and our
        {' '}<Link href="/corrections-policy/">corrections policy</Link> for how to flag a USDA FDC mismatch, an FDA
        Daily Value tier error, a FAO/WHO DIAAS computation error, or a NOVA classification dispute.
      </p>

      {process.env.CW_HUB_LINK === "on" && (
        <>
          <h2>Network</h2>
          <p>
            CalorieWize is part of the <a href="https://datapeekfacts.com" rel="noopener">DataPeek Research Network</a>, a
            collection of public-data tools covering US nutrition (USDA FDC), housing (HUD FMR), tax (IRS / state revenue),
            healthcare (CMS / CDC), and other civic domains. The network shares editorial standards, hosting
            infrastructure, and a single corrections workflow.
          </p>
        </>
      )}

      <h2>Contact</h2>
      <p>
        Questions, corrections, or feedback: see the <Link href="/contact/">contact page</Link>. For corrections
        specifically, the <Link href="/corrections-policy/">corrections policy</Link> explains what we can fix on the
        CalorieWize side, what must be routed to USDA FoodData Central, and what must be raised with the manufacturer
        under the FDA FALCPA / FDA Food Labeling Guide.
      </p>

      <AuthorBox layer="legal" slug="about" />

      <CrossSiteLinks current="CalorieWize" />
    </article>
  );
}
