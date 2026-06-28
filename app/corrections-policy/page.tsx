import type { Metadata } from "next";
import Link from "next/link";
import { AuthorBox } from "@/components/AuthorBox";
import { LEGAL_VINTAGES } from "@/lib/authorship";
import { breadcrumbSchema } from "@/lib/schema";

const desc = "Corrections policy for CalorieWize — how to flag a nutrient value that disagrees with USDA FoodData Central, FDA Daily Value tier mismatches, FAO/WHO DIAAS computation errors, NOVA classification disputes, and what must be raised with USDA, FDA, NIH ODS, or the manufacturer rather than CalorieWize.";

export const metadata: Metadata = {
  title: "Corrections Policy — CalorieWize",
  description: desc,
  alternates: { canonical: "/corrections-policy/" },
  openGraph: { title: "Corrections Policy — CalorieWize", description: desc, url: "/corrections-policy/" },
};

function formatVintage(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function CorrectionsPolicyPage() {
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Corrections Policy', url: '/corrections-policy/' },
  ];

  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />

      <h1>Corrections Policy</h1>
      <p className="text-sm text-slate-500 mb-6">
        Last updated:{' '}
        <time dateTime={LEGAL_VINTAGES['corrections-policy']}>
          {formatVintage(LEGAL_VINTAGES['corrections-policy'])}
        </time>
      </p>
      <p className="lead text-lg text-slate-600">
        Nutrition pages drive real decisions. When a CalorieWize value disagrees with the USDA FoodData Central (USDA
        FDC) source, the FDA Daily Value framework, the FAO/WHO DIAAS reference pattern, or the NOVA processing
        classification it should match, we want to know quickly &mdash; but the right correction path depends on
        whether the error is on the CalorieWize side, in the underlying USDA FDC row, in the FDA-regulated
        manufacturer label submission, or in the FAO/WHO / NOVA reference framework itself.
      </p>

      <h2>1. Why this page exists</h2>
      <p>
        CalorieWize restates figures from public-data releases issued by USDA Agricultural Research Service (the USDA
        Foundation Foods, USDA SR Legacy, USDA FNDDS, and USDA Branded Foods data types of FoodData Central), the US
        Food and Drug Administration (FDA Daily Values codified at 21 CFR &sect; 101.9), the joint FAO/WHO 2013 expert
        consultation on DIAAS protein quality, the four-group NOVA processing framework published in BMJ, and the
        NIH Office of Dietary Supplements (NIH ODS) per-nutrient fact sheets. When a USDA FDC row moves, when our
        restatement misreads a USDA release, when an FDA Daily Value tier classification surfaces incorrectly, when
        a FAO/WHO DIAAS computation has a defect, or when a typographical error slips through review, the right
        thing is to fix the page on the record and log the change.
      </p>

      <h2>2. What counts as a correction</h2>
      <p>
        We treat a change as a correction whenever the published CalorieWize figure or claim differs from what the
        primary-source USDA, FDA, FAO/WHO, NOVA, or NIH ODS release supports. Concretely, that includes:
      </p>
      <ul>
        <li>
          A USDA FoodData Central nutrient value (calories, protein, fat, carbohydrate, sodium, etc.) transcribed
          incorrectly against the USDA FDC row at fdc.nal.usda.gov.
        </li>
        <li>
          An FDA Daily Value tier (5% / 20% low / high under 21 CFR &sect; 101.9) computed incorrectly from the
          USDA-reported per-100g value.
        </li>
        <li>
          A FAO/WHO DIAAS protein-quality tier that does not match the FAO/WHO 2013 reference amino-acid scoring
          pattern given the USDA amino-acid panel inputs.
        </li>
        <li>
          A NOVA processing classification (Group 1 / 2 / 3 / 4) that misreads the Monteiro et al. NOVA framework or
          the FAO documents adopting it.
        </li>
        <li>
          A USDA Atwater reconciliation gap that misuses the USDA general factors (4 / 4 / 9 / 7 kcal/g) or
          misroutes the USDA-reported energy value.
        </li>
        <li>
          A food name, USDA category label, or USDA FDC ID that does not match the USDA FoodData Central record.
        </li>
        <li>
          A broken or misdirected outbound citation link to a USDA, FDA, NIH ODS, FAO/WHO, or CDC release URL.
        </li>
      </ul>
      <p>
        Routine refreshes that flow from a new USDA FDC sync, a FDA Daily Value update, or a NIH ODS fact-sheet
        revision are not corrections &mdash; they are scheduled updates handled through our{' '}
        <Link href="/editorial-policy/">editorial policy</Link>&apos;s review cadence.
      </p>

      <h2>3. Three kinds of error and what we can do about each</h2>
      <ol>
        <li>
          <strong>Display or computation error on the CalorieWize side.</strong> A page shows a value that does not
          match the underlying USDA FDC row, a classifier (FDA DvTier, FAO/WHO DIAAS tier, NOVA tier) is wrong, or
          the USDA Atwater reconciliation / FDA %DV calculation is incorrect. We can fix this directly &mdash;
          patches deploy to all affected pages, and the editorial review date bumps.
        </li>
        <li>
          <strong>Disagreement with the current USDA FoodData Central entry.</strong> The CalorieWize cached snapshot
          is stale relative to a more recent USDA FDC update. We can resync to the current USDA FDC row, which
          usually resolves the discrepancy. USDA data vintage updates accordingly.
        </li>
        <li>
          <strong>Disagreement with the manufacturer&apos;s FDA Nutrition Facts label (USDA Branded Foods only).</strong>{' '}
          USDA Branded Foods rows reflect what manufacturers submitted to the Global Data Synchronization Network
          (GDSN). If a current FDA-mandated package label disagrees with the USDA FDC entry, the manufacturer must
          update the USDA FDC submission &mdash; we cannot override USDA from the CalorieWize side. We route the
          report to the manufacturer / USDA where appropriate.
        </li>
      </ol>

      <h2>4. How to report a correction</h2>
      <p>For us to act on a correction, we need:</p>
      <ul>
        <li>
          <strong>The CalorieWize page URL</strong> &mdash; the exact page where the value appears.
        </li>
        <li>
          <strong>The specific value you believe is wrong</strong> &mdash; nutrient name, the value the CalorieWize
          page shows, and the value you believe is correct against USDA FDC.
        </li>
        <li>
          <strong>The USDA FDC ID you cross-checked against</strong> &mdash; every CalorieWize food page links out to
          its source USDA FDC entry at fdc.nal.usda.gov. If the linked USDA FDC entry agrees with us, the issue is
          at USDA; if it disagrees, the issue is on the CalorieWize side and we can resync.
        </li>
        <li>
          <strong>For label-vs-USDA disputes:</strong> the brand name and a photo of the current FDA-mandated Nutrition
          Facts panel. We will route to the manufacturer or USDA Branded Foods program if needed.
        </li>
      </ul>
      <p>
        Email all of the above to <a href="mailto:datapeekfacts@gmail.com">datapeekfacts@gmail.com</a> with &ldquo;CalorieWize
        correction&rdquo; in the subject line. We accept anonymous reports. Reporting a correction does not create an
        obligation on either side, and the CalorieWize Editorial Team evaluates the claim against the primary-source
        USDA, FDA, FAO/WHO, or NOVA release on its own merits.
      </p>

      <h2>5. How we triage</h2>
      <ol>
        <li>
          <strong>Acknowledge</strong> &mdash; every report receives a routing acknowledgement within five working
          days. Anonymous reports are acknowledged via a public note on this page when the change ships.
        </li>
        <li>
          <strong>Verify</strong> &mdash; the CalorieWize Editorial Team pulls the cited USDA FDC ID and reproduces
          the figure against our ingestion. For FDA Daily Value tier disputes, we cross-check 21 CFR &sect; 101.9.
          For FAO/WHO DIAAS computation disputes, we cross-check the 2013 FAO Expert Consultation reference pattern.
          For NOVA tier disputes, we cross-check the Monteiro et al. framework.
        </li>
        <li>
          <strong>Fix</strong> &mdash; for type 1 errors we patch template / classifier / calculation; for type 2 we
          resync USDA FDC; for type 3 we route to manufacturer / USDA.
        </li>
        <li>
          <strong>Log</strong> &mdash; the change is recorded with the prior value, the new value, the USDA / FDA /
          FAO/WHO / NIH ODS release URL, and the date of change.
        </li>
      </ol>

      <h2>6. Refresh cadence vs corrections</h2>
      <p>
        Routine refreshes happen when a new USDA, FDA, FAO/WHO, NIH ODS, or CDC release lands. Specifically:
      </p>
      <ul>
        <li>
          USDA FoodData Central: continuous updates by USDA staff; major USDA SR Legacy and USDA Foundation Foods
          refreshes on a multi-year cadence; USDA Branded Foods updates per manufacturer GDSN submission.
        </li>
        <li>
          FDA Daily Value (21 CFR &sect; 101.9): stable since the FDA 2016 Final Rule, with the FDA 2021-2022
          added-sugars and vitamin-D updates already in effect.
        </li>
        <li>
          FAO/WHO DIAAS: anchored to the FAO/WHO 2013 expert consultation; a future FAO consultation may shift the
          reference amino-acid scoring pattern.
        </li>
        <li>
          NIH ODS per-nutrient fact sheets: updated on a per-nutrient cadence by NIH ODS staff.
        </li>
        <li>
          CDC NHANES: two-year-batch publication cycle.
        </li>
      </ul>
      <p>
        A scheduled refresh in any of these categories is logged in the USDA / FDA / FAO/WHO / NIH ODS / CDC vintage
        rather than as a correction.
      </p>

      <h2>7. Service levels</h2>
      <p>
        We aim to ship verified corrections within seven calendar days of acknowledgement for typographical and
        citation errors against USDA, FDA, FAO/WHO, NIH ODS, or CDC sources, and within thirty calendar days for
        changes that require a USDA FDC resync or re-ingestion of an FDA / FAO/WHO reference. These are working
        targets the CalorieWize Editorial Team holds itself to, not contractual guarantees.
      </p>

      <h2>8. What we cannot correct</h2>
      <ul>
        <li>
          <strong>Personal disagreements with USDA methodology.</strong> USDA Agricultural Research Service&apos;s
          sampling design, USDA lab methods, and USDA Atwater factor choices are documented at USDA FoodData Central
          and in USDA Agriculture Handbook 74. CalorieWize surfaces the data USDA publishes; we do not arbitrate
          USDA&apos;s decisions.
        </li>
        <li>
          <strong>FDA labeling rules.</strong> The FDA 5% / 20% Daily Value tiers and the FDA 2,000-calorie reference
          diet are FDA conventions, codified at 21 CFR &sect; 101.9 and documented on the FDA Daily Values guidance
          page. Disagreements about whether the FDA 2,000-kcal reference is right for an individual reader are
          addressed in the methodology page&apos;s &ldquo;Limitations&rdquo; section.
        </li>
        <li>
          <strong>Take-down requests for accurate USDA, FDA, or FAO/WHO values.</strong> We will not remove a correctly
          stated USDA FDC nutrient value, an FDA Daily Value tier, or a FAO/WHO DIAAS tier on request, though we will
          revisit any specific claim if a reader believes the USDA, FDA, or FAO/WHO release does not support it.
        </li>
        <li>
          <strong>Outdated USDA Branded Foods entries.</strong> If a manufacturer has discontinued or reformulated a
          product, the USDA FDC entry can persist for some time. CalorieWize does not delete entries unless USDA does.
        </li>
        <li>
          <strong>Disputes about a primary USDA, FDA, FAO, WHO, NIH, or CDC release itself.</strong> If a reader
          believes USDA, FDA, NIH ODS, FAO, WHO, or CDC has published a flawed figure, the right venue is the
          issuing agency&apos;s own revisions process &mdash; USDA, FDA, NIH ODS, FAO, WHO, and CDC each publish
          their own correction protocols.
        </li>
      </ul>

      <h2>9. Material vs minor corrections</h2>
      <p>
        Material corrections &mdash; USDA-citation logic fixes, FDA-tier classifier-threshold changes, FAO/WHO DIAAS
        computation fixes, NOVA classifier logic fixes, structural template changes &mdash; bump the editorial review
        date so every affected CalorieWize page reflects the change. Minor copy edits (typos, small clarifications)
        do not. The two-date split (USDA data vintage + editorial reviewed date) keeps the &ldquo;reviewed&rdquo;
        signal meaningful.
      </p>

      <h2>10. Privacy of reporters</h2>
      <p>
        We do not publish reporter names or contact details unless asked to. Aggregate counts of corrections by
        category (USDA FDC mismatch / FDA Daily Value tier / FAO/WHO DIAAS computation / NOVA tier / typographical)
        may appear in editorial retrospectives, but individual reports are not surfaced as named entries.
      </p>

      <h2>11. Contact</h2>
      <p>
        For all correction requests, email <a href="mailto:datapeekfacts@gmail.com">datapeekfacts@gmail.com</a>. For
        non-correction questions, see the <Link href="/contact/">contact page</Link>; for editorial concerns, see the{' '}
        <Link href="/editorial-policy/">editorial policy</Link>.
      </p>

      <AuthorBox layer="legal" slug="corrections-policy" />
    </article>
  );
}
