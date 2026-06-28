import type { Metadata } from "next";
import Link from "next/link";
import { AuthorBox } from "@/components/AuthorBox";
import { LEGAL_VINTAGES } from "@/lib/authorship";
import { breadcrumbSchema } from "@/lib/schema";

const desc = "Editorial policy for CalorieWize — what we publish, how it is reviewed, the role of the CalorieWize Editorial Team, and the USDA / FDA / FAO/WHO / NIH ODS / CDC sourcing standards we apply across food pages, derived rollups, methodology, and guides.";

export const metadata: Metadata = {
  title: "Editorial Policy — CalorieWize",
  description: desc,
  alternates: { canonical: "/editorial-policy/" },
  openGraph: { title: "Editorial Policy — CalorieWize", description: desc, url: "/editorial-policy/" },
};

function formatVintage(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function EditorialPolicyPage() {
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Editorial Policy', url: '/editorial-policy/' },
  ];

  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />

      <h1>Editorial Policy</h1>
      <p className="text-sm text-slate-500 mb-6">
        Last updated:{' '}
        <time dateTime={LEGAL_VINTAGES['editorial-policy']}>
          {formatVintage(LEGAL_VINTAGES['editorial-policy'])}
        </time>
      </p>
      <p className="lead text-lg text-slate-600">
        CalorieWize publishes nutrition data drawn from the US Department of Agriculture (USDA) FoodData Central
        public-data release. Nutrition is a Your-Money-or-Your-Life (YMYL) topic &mdash; readers use these USDA, FDA,
        FAO/WHO, NIH ODS, and CDC-derived classifications to make decisions affecting weight, athletic performance,
        chronic disease risk, and medical-condition management. This page documents the editorial standards CalorieWize
        applies.
      </p>

      <h2>1. Who publishes CalorieWize</h2>
      <p>
        CalorieWize is published by the CalorieWize Editorial Team, a working group inside the DataPeek Research
        Network responsible for ingesting USDA FoodData Central API releases and producing the structured restatement
        readers see on every food page, category rollup, and methodology page. The team cross-references each USDA
        FDC row against the FDA Daily Value framework (21 CFR &sect; 101.9), the FAO/WHO DIAAS expert consultation
        (2013), the NOVA processing classification published in BMJ (Monteiro et al., 2018) and adopted by FAO
        documents, and per-nutrient guidance from the NIH Office of Dietary Supplements (NIH ODS). Corrections route
        through the team mailbox so the USDA / FDA / FAO/WHO / NIH ODS review trail survives contributor turnover.
      </p>

      <h2>2. Who reviews what</h2>
      <p>
        Review responsibilities are split by content layer:
      </p>
      <ul>
        <li>
          <strong>Methodology, About, and policy pages</strong> are reviewed line-by-line by the CalorieWize Editorial
          Team before publication and on every material update, with each USDA / FDA / FAO/WHO / NIH ODS citation
          cross-checked against the agency&apos;s primary release URL.
        </li>
        <li>
          <strong>Long-form guides</strong> are reviewed by the CalorieWize Editorial Team before publication. Material
          updates to USDA-, FDA-, FAO/WHO-, or NIH ODS-cited claims trigger re-review.
        </li>
        <li>
          <strong>Per-food pages, category rollups, state pages, and diet-tier lists</strong> are template-driven. The
          CalorieWize Editorial Team reviews the template, the classifier code (FDA DvTier, FAO/WHO DIAAS tier, NOVA
          tier), and the underlying USDA calculations &mdash; not every individual page. A change to the template,
          classifier thresholds, or display logic bumps the editorial review date so the change is visible.
        </li>
      </ul>

      <h2>3. Primary sources CalorieWize ingests</h2>
      <ul>
        <li>
          <strong>USDA FoodData Central (USDA FDC)</strong> &mdash; fdc.nal.usda.gov &mdash; the single source of every
          numeric nutrient value on the site. USDA FDC consolidates USDA SR Legacy, USDA Foundation Foods, USDA FNDDS
          (used in CDC NHANES), and USDA Branded Foods.
        </li>
        <li>
          <strong>USDA Agriculture Handbook 74 (Merrill &amp; Watt)</strong> &mdash; foundational reference for the
          USDA general Atwater factors (4 / 4 / 9 / 7 kcal/g) and specific-factor adjustments used in the Atwater
          reconciliation surfaced on each food page.
        </li>
      </ul>

      <h2>4. Reference frameworks CalorieWize cites</h2>
      <ul>
        <li>
          <strong>FDA Daily Values (21 CFR &sect; 101.9)</strong> &mdash; the FDA Daily Reference Values codified in the
          Code of Federal Regulations, anchored to the FDA 2,000-calorie reference diet, with the FDA 5% / 20%
          low-/high-tier convention used in CalorieWize DvTier classifications.
        </li>
        <li>
          <strong>FAO/WHO DIAAS (2013 Expert Consultation)</strong> &mdash; the FAO/WHO Dietary Indispensable Amino
          Acid Score method, with the FAO/WHO reference amino-acid scoring pattern used in CalorieWize ProteinQuality
          tiers. Distinct from the older FAO/WHO PDCAAS that FDA still references in some labeling contexts.
        </li>
        <li>
          <strong>NOVA classification (Monteiro et al., BMJ 2018; FAO documents)</strong> &mdash; the four-group NOVA
          processing classification used in CalorieWize NovaTier.
        </li>
        <li>
          <strong>NIH Office of Dietary Supplements (NIH ODS)</strong> &mdash; ods.od.nih.gov per-nutrient fact sheets
          cross-referenced where DRI / RDA / UL guidance differs materially from the FDA Daily Value.
        </li>
        <li>
          <strong>CDC NHANES and CDC Nutrition</strong> &mdash; population-level dietary intake data and the CDC growth
          charts referenced for pediatric and population context.
        </li>
        <li>
          <strong>USDA-HHS Dietary Guidelines for Americans</strong> &mdash; dietaryguidelines.gov &mdash; the joint
          USDA / HHS federal dietary guidance referenced for population-level recommendations.
        </li>
      </ul>

      <h2>5. The composite read on every food page</h2>
      <p>
        Each food page surfaces a composite four-paragraph verdict driven by five deterministic levers anchored to
        USDA, FDA, FAO/WHO, and NOVA primary releases:
      </p>
      <ol>
        <li>
          <strong>FDA Daily Value tier (DvTier)</strong> &mdash; per-nutrient 5% / 20% classification under 21 CFR
          &sect; 101.9.
        </li>
        <li>
          <strong>USDA Macronutrient profile</strong> &mdash; energy share from USDA-reported protein, fat, and
          carbohydrate using USDA general Atwater factors.
        </li>
        <li>
          <strong>FAO/WHO DIAAS protein-quality tier</strong> &mdash; 2013 FAO Expert Consultation reference pattern.
        </li>
        <li>
          <strong>NOVA processing tier</strong> &mdash; four-group classification per Monteiro and FAO.
        </li>
        <li>
          <strong>USDA Atwater reconciliation</strong> &mdash; reconstructed kcal vs USDA-reported energy, surfacing
          the gap between general and specific Atwater factors.
        </li>
      </ol>
      <p>
        Each lever is a pure function of published USDA FDC data against a named FDA, FAO/WHO, or NOVA framework. See
        the <Link href="/methodology/">methodology page</Link> for the formulas and band cutoffs.
      </p>

      <h2>6. What CalorieWize does not do</h2>
      <ul>
        <li>
          <strong>No proprietary &ldquo;health score.&rdquo;</strong> We do not collapse multiple USDA-, FDA-, or
          FAO/WHO-derived dimensions into a single proprietary score. Single-number scores hide tradeoffs that matter
          for actual diet choices. CalorieWize surfaces the underlying USDA / FDA / FAO/WHO / NOVA classifications
          instead.
        </li>
        <li>
          <strong>No estimated or interpolated USDA values.</strong> Every numeric value comes from a USDA FDC row.
          CalorieWize uses deterministic classifiers (pure functions of USDA inputs against FDA, FAO/WHO, and NOVA
          frameworks) for derived labels; the underlying values are the published USDA row, not a recomputed estimate.
        </li>
        <li>
          <strong>No undisclosed conflicts.</strong> CalorieWize earns ad revenue through Google AdSense. We do not have
          brand partnerships, sponsored content, or affiliate relationships with food manufacturers, supplement brands,
          or diet programs. If that ever changes, the relationship will be disclosed on the relevant page. None of the
          USDA, FDA, NIH ODS, FAO, WHO, or CDC source attribution on the site is sponsored or paid &mdash; the source
          list reflects which agencies actually publish the underlying data.
        </li>
        <li>
          <strong>No clinical advice.</strong> Page content describes public USDA, FDA, FAO/WHO, NIH ODS, and CDC
          nutrition data and how it is classified. It is not a substitute for advice from a Registered Dietitian
          Nutritionist (RDN) or physician.
        </li>
      </ul>

      <h2>7. Review cadence</h2>
      <p>
        Each USDA, FDA, FAO/WHO, NIH ODS, or CDC release has its own cadence. USDA refreshes FoodData Central
        continuously; major USDA SR Legacy and USDA Foundation Foods refreshes occur on a multi-year cadence; USDA
        Branded Foods updates as manufacturers submit GDSN data. FDA Daily Value rules are stable since the FDA 2016
        Final Rule on the Nutrition Facts label, with the FDA 2021-2022 added-sugars and vitamin-D updates already
        in effect. FAO/WHO DIAAS is anchored to the 2013 FAO consultation. CDC NHANES cycles publish on a
        two-year-batch cadence. The CalorieWize editorial-review date is independent of these underlying USDA / FDA /
        FAO/WHO / NIH ODS / CDC dates.
      </p>

      <h2>8. Data vintage and reviewed dates</h2>
      <p>
        Each page surfaces two distinct dates in the AuthorBox at the bottom. The USDA data vintage is the date of the
        last USDA FDC sync into <code>caloriewize.db</code>. The editorial review date is when the page template,
        methodology language, USDA-citation accuracy, or FDA / FAO/WHO / NOVA classifier code last changed. Keeping
        the USDA-data vintage and the editorial-review date separate prevents USDA syncs from falsely refreshing
        editorial freshness, and prevents editorial-language updates from falsely refreshing USDA data freshness.
      </p>

      <h2>9. Corrections and updates</h2>
      <p>
        Errors fall into three buckets, each handled differently &mdash; see the{' '}
        <Link href="/corrections-policy/">corrections policy</Link>{' '}
        for the full path covering USDA FDC mismatches, FDA Daily Value tier errors, FAO/WHO DIAAS computation errors,
        and NOVA classification disputes. Material corrections to USDA-citation logic, FDA-tier classifier thresholds,
        or FAO/WHO DIAAS computation trigger a bumped editorial review date so the change is visible on every
        affected page.
      </p>

      <h2>10. Use of generative AI</h2>
      <p>
        Generative-AI tools are used as drafting and code-review assistants. Every numeric figure on the site comes
        from a named USDA FoodData Central API call; every derived classification is a deterministic function of
        USDA inputs against the FDA, FAO/WHO, NIH ODS, or NOVA framework explicitly cited on the methodology page.
        Prose drafted with AI assistance is reviewed by the CalorieWize Editorial Team against the USDA FDC, FDA
        Daily Value, FAO/WHO DIAAS, NIH ODS, or CDC source before publication.
      </p>

      <h2>11. What the editorial pipeline does NOT cover</h2>
      <ul>
        <li>
          <strong>Glycemic index / glycemic load</strong> &mdash; not in USDA FDC; CalorieWize does not derive GI from
          USDA macronutrient rows.
        </li>
        <li>
          <strong>FODMAP content</strong> &mdash; tracked by Monash University under license; CalorieWize does not
          surface FODMAP data.
        </li>
        <li>
          <strong>Pesticide residue and contamination</strong> &mdash; tracked by FDA Total Diet Study and EPA / USDA
          Pesticide Data Program, not USDA FDC.
        </li>
        <li>
          <strong>Allergen cross-contamination warnings</strong> &mdash; governed by FDA FALCPA (21 USC &sect; 343) and
          FDA FASTER Act. The package label is the authoritative allergen source, not USDA FDC or CalorieWize.
        </li>
      </ul>

      <h2>12. Contact</h2>
      <p>
        Editorial concerns: see the <Link href="/contact/">contact page</Link>. For factual data errors against the
        USDA FDC entry, the <Link href="/corrections-policy/">corrections policy</Link> explains what CalorieWize can
        fix on its side and what must be raised with USDA or the manufacturer (in the case of USDA Branded Foods
        manufacturer-submitted values).
      </p>

      <AuthorBox layer="legal" slug="editorial-policy" />
    </article>
  );
}
