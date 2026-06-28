import type { Metadata } from "next";
import { AuthorBox } from "@/components/AuthorBox";
import { LEGAL_VINTAGES } from "@/lib/authorship";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Disclaimer and limitations of liability for CalorieWize. Covers the USDA FoodData Central data lineage, FDA label tolerances, FAO/WHO DIAAS protein-quality methodology, NIH Office of Dietary Supplements references, and the YMYL boundary between nutrition data and clinical dietetic advice.",
  alternates: { canonical: "/disclaimer/" },
  openGraph: { url: "/disclaimer/" },
};

function formatVintage(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function DisclaimerPage() {
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Disclaimer', url: '/disclaimer/' },
  ];

  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />

      <h1 className="text-3xl font-bold text-slate-700 mb-6">Disclaimer</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: <time dateTime={LEGAL_VINTAGES.disclaimer}>{formatVintage(LEGAL_VINTAGES.disclaimer)}</time></p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Informational and educational use only</h2>
      <p>
        CalorieWize publishes nutrition data drawn from named US federal public-data releases. Every numeric value on the
        site is a restatement of a row in the USDA FoodData Central (USDA FDC) database, classified against reference
        frameworks published by the US Food and Drug Administration (FDA), the joint FAO/WHO expert consultation on
        Dietary Indispensable Amino Acid Score (FAO/WHO DIAAS), the National Institutes of Health Office of Dietary
        Supplements (NIH ODS), and the Centers for Disease Control and Prevention (CDC). The site exists to make these
        public USDA, FDA, NIH, and CDC releases easier to read &mdash; not to provide personal nutritional, dietary,
        medical, or clinical advice. Nothing on CalorieWize constitutes a recommendation by USDA, FDA, NIH ODS, CDC,
        FAO, WHO, or any registered dietitian (RDN).
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Population mean &ne; individual portion guarantee</h2>
      <p>
        USDA FDC nutrient values are <strong>population means</strong>: each value is the laboratory-analysed average of
        multiple food samples (USDA SR Legacy and USDA Foundation Foods data types) or a manufacturer-reported value
        accepted by USDA via the Global Data Synchronization Network (USDA Branded Foods data type). The single
        per-100g value on a CalorieWize page therefore carries an underlying USDA analytical variance that USDA itself
        documents, and on top of that the FDA permits Nutrition Facts labels to deviate by &plusmn;20% from the stated
        value under 21 CFR &sect; 101.9. A specific banana, slice of cheese, or chicken breast in front of a reader
        can legitimately differ from the displayed USDA mean by several percent for natural-variability reasons
        without any error in USDA, FDA, or CalorieWize logic. Readers calibrating tight clinical targets (renal
        potassium, diabetic carbohydrate, sodium-restricted hypertension diets) should treat the displayed USDA values
        as approximate population guidance, not individual portion guarantees.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Not professional medical or dietetic advice</h2>
      <p>
        Nutrition is a Your-Money-or-Your-Life (YMYL) topic. Individual nutritional needs depend on age, sex, body
        composition, physical activity, pregnancy or lactation status, medical conditions, prescribed medications,
        food allergies, eating-disorder history, and goals &mdash; none of which a USDA FDC row, an FDA Daily Value
        tier, a FAO/WHO DIAAS tier, or a NOVA processing classification can know. For dietary changes related to
        managing a medical condition (diabetes, kidney disease, hypertension, food allergies, eating disorders, celiac,
        IBD, oncology nutrition, etc.), consult your treating clinician or a Registered Dietitian Nutritionist (RDN /
        RD). For US federal nutrition guidance, refer to the USDA and HHS Dietary Guidelines for Americans
        (DietaryGuidelines.gov) and the NIH Office of Dietary Supplements (ods.od.nih.gov). For pediatric guidance,
        the CDC Growth Charts and the American Academy of Pediatrics are the appropriate references &mdash; CalorieWize
        is not.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. USDA FoodData Central data lineage</h2>
      <p>
        Per-food nutrient values on CalorieWize are sourced directly from the USDA FoodData Central public API at
        fdc.nal.usda.gov &mdash; specifically the USDA SR Legacy (Standard Reference) dataset, USDA Foundation Foods,
        USDA FNDDS (Food and Nutrient Database for Dietary Studies), and USDA Branded Foods data types. We re-publish
        the underlying USDA row values without recomputation; derived classifications &mdash; the FDA Daily Value tier
        (21 CFR &sect; 101.9), the FAO/WHO DIAAS protein-quality tier (FAO 2013 expert consultation report), the NOVA
        processing-group tier (Monteiro et al., NOVA classification published in BMJ and adopted by FAO documents) &mdash;
        are deterministic functions of those published USDA inputs against those named reference frameworks. The
        Atwater reconciliation surfaced on each food page uses the USDA general Atwater factors (4 / 4 / 9 / 7 kcal per
        gram, codified in USDA Agriculture Handbook 74 and at 21 CFR &sect; 101.9 (c)(1)(i)) and compares against the
        USDA-reported energy value. While USDA FDC is updated regularly by USDA staff, individual food rows may be
        revised, retired, or superseded by USDA between our syncs; USDA Branded Foods entries vary by product
        formulation and lot. Verify any value relied upon for clinical, allergen, or labeling decisions against the
        manufacturer&apos;s current Nutrition Facts panel and the live USDA FDC API.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. FDA Daily Value tiers and the 2,000 kcal reference</h2>
      <p>
        Daily Value (DV) percentages displayed on CalorieWize use the FDA Daily Reference Values codified at 21 CFR
        &sect; 101.9, anchored to the FDA 2,000-calorie reference diet for adults aged 4 years and older. FDA itself
        notes (FDA Food Labeling Guide, FDA &quot;Daily Value on the New Nutrition and Supplement Facts Labels&quot;)
        that 2,000 kcal is a single reference value that does not represent the actual energy need of any specific
        individual &mdash; sedentary smaller women may need closer to 1,600 kcal per day; active adult men may need
        2,500-3,000 kcal per day. The FDA 5% / 20% Daily Value &quot;low / high&quot; threshold convention used in
        CalorieWize DvTier classifications is the FDA convention; it is not a clinical recommendation. CalorieWize
        cross-references the NIH Office of Dietary Supplements per-nutrient fact sheets where DRI / RDA / UL guidance
        differs materially from the FDA Daily Value (notably for vitamin D, magnesium, choline, omega-3 fatty acids).
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. FAO/WHO DIAAS protein-quality tiers</h2>
      <p>
        The protein-quality tier on each CalorieWize food page applies the FAO/WHO Dietary Indispensable Amino Acid
        Score (DIAAS) method, published in the 2013 FAO Expert Consultation Report on Protein Quality Evaluation in
        Human Nutrition. DIAAS replaced the older FAO/WHO PDCAAS (Protein Digestibility-Corrected Amino Acid Score)
        method, though FDA still references PDCAAS in some labeling contexts. DIAAS values cited on CalorieWize are
        either taken from the FAO 2013 report directly or computed from the USDA FDC amino-acid panel against the
        FAO/WHO reference amino-acid scoring pattern. DIAAS reflects population-mean digestibility and is not
        individualised &mdash; gut conditions, age (DIAAS scoring varies for infants vs older children vs adults), and
        cooking method can shift effective digestibility.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. NOVA classification and ultra-processed-food framing</h2>
      <p>
        NOVA classifications on CalorieWize follow the four-group NOVA system published by Monteiro and colleagues
        (Cad. Saude Publica, 2010; updated in BMJ, 2018) and referenced in FAO documents on ultra-processed foods.
        NOVA is a public-health classification of food <em>processing extent</em>, not a measure of food <em>healthfulness</em> &mdash;
        Group 4 (ultra-processed) includes foods that may be appropriate in certain dietary contexts, and Group 1
        (unprocessed) includes foods (e.g. raw oysters, undercooked eggs) with their own clinical-safety concerns.
        Readers should not interpret a CalorieWize NOVA tier as a clinical recommendation for or against a specific
        food. CDC and NIH ODS provide separate guidance on dietary patterns; the USDA-HHS Dietary Guidelines for
        Americans is the appropriate federal reference.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. What this site does NOT include</h2>
      <p>
        The CalorieWize composite read deliberately excludes the following, even when they materially affect a
        reader&apos;s dietary decisions:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Glycemic index / glycemic load.</strong> Not tracked by USDA. The University of Sydney maintains the
          primary GI database. CalorieWize does not estimate GI from macronutrients because the USDA FDC dataset does
          not support that derivation.
        </li>
        <li>
          <strong>FODMAP content.</strong> Monash University maintains the primary FODMAP dataset under license.
          CalorieWize does not surface FODMAP data and does not derive it from USDA macronutrient rows.
        </li>
        <li>
          <strong>Polyphenols and phytochemicals.</strong> Only partial coverage exists in USDA FDC. The Phenol-Explorer
          database (INRA, France) is the more comprehensive reference; CalorieWize does not mirror it.
        </li>
        <li>
          <strong>Pesticide residue, heavy-metal contamination, mycotoxin levels.</strong> Tracked by FDA Total Diet
          Study and EPA / USDA Pesticide Data Program (PDP), not USDA FDC.
        </li>
        <li>
          <strong>Allergen cross-contamination warnings.</strong> The FDA Food Allergen Labeling and Consumer Protection
          Act (FALCPA, 21 USC &sect; 343) and FDA FASTER Act (2021) govern allergen labeling. The package label is the
          authoritative allergen source, not USDA FDC or CalorieWize.
        </li>
        <li>
          <strong>Drug-nutrient interactions.</strong> NIH ODS publishes some interactions; the FDA Drug Safety
          Communications cover others. CalorieWize is not a drug-nutrient interaction database.
        </li>
        <li>
          <strong>Bioavailability and individual absorption.</strong> USDA reports what is in the food, not what an
          individual body absorbs. Bioavailability varies by food matrix, preparation, gut state, and individual
          factors. NIH ODS fact sheets discuss bioavailability per nutrient.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. Data vintages and refresh cadence</h2>
      <p>
        USDA FoodData Central is updated continuously by USDA staff; major USDA SR Legacy and USDA Foundation Foods
        refreshes occur on a multi-year cadence. USDA Branded Foods entries update as manufacturers submit GDSN data
        to USDA. FDA Daily Value rules are stable since the 2016 FDA Final Rule on the Nutrition Facts label, with the
        2021-2022 added-sugars and vitamin-D updates already in effect. FAO/WHO DIAAS is anchored to the 2013 FAO
        expert consultation; an updated FAO consultation may shift reference patterns in future. CalorieWize labels
        each page with a data vintage (last USDA sync) and an editorial-review date (last template / classifier
        change). The two-date split exists so that USDA syncs do not falsely refresh editorial vintage and editorial
        edits do not falsely refresh data vintage.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">10. No professional-advice relationship</h2>
      <p>
        Reading CalorieWize does not create a dietitian-client, physician-patient, or any other professional
        relationship. The site is a structured restatement of USDA FoodData Central, FDA Daily Value, FAO/WHO DIAAS,
        and NOVA classifications. For decisions with real health consequences &mdash; managing diabetes, hypertension,
        kidney disease, eating disorders, food allergies, or planning a clinical diet &mdash; consult a qualified
        Registered Dietitian Nutritionist (RDN), licensed physician, or other appropriate clinician who knows your
        individual circumstances. The Academy of Nutrition and Dietetics (eatright.org) maintains the US RDN
        registry; the Commission on Dietetic Registration (cdrnet.org) verifies credentials.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">11. External links and cross-network</h2>
      <p>
        CalorieWize links to USDA, FDA, NIH ODS, CDC, FAO, WHO, the National Academies (DRI / RDA), and a handful of
        related calculators in our public-data network. We do not control those USDA, FDA, NIH, CDC, FAO, WHO, or
        external destinations and are not responsible for their content, privacy practices, or accuracy. Where we cite
        Monash University FODMAP, University of Sydney GI, or INRA Phenol-Explorer as reference databases, we do so
        for reference only and do not republish their values.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">12. Advertising and ad-network attribution</h2>
      <p>
        CalorieWize displays advertising via Google AdSense and partner networks. Advertisements are not endorsements,
        are not vetted by the CalorieWize Editorial Team, and may target a reader based on signals collected by the
        ad network. None of the USDA, FDA, NIH ODS, FAO, WHO, or CDC source attribution on the site is sponsored or
        paid &mdash; the source list reflects which agencies actually publish the underlying data, not commercial
        relationships.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">13. Limitation of liability</h2>
      <p>
        In no event shall CalorieWize, its owners, operators, or contributors be liable for any direct, indirect,
        incidental, consequential, or punitive damages arising from the use of this website or its restatement of
        USDA FoodData Central, FDA Daily Value, FAO/WHO DIAAS, NOVA, NIH ODS, or CDC data. The USDA, FDA, NIH ODS,
        CDC, FAO, and WHO releases themselves are subject to those agencies&apos; own correction and revision
        procedures.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">14. Reporting an error</h2>
      <p>
        If a CalorieWize figure disagrees with the published USDA FDC row it should match, the right path is the{" "}
        <a href="/corrections-policy/" className="text-slate-700 hover:underline">corrections policy</a>, which
        describes how reports are triaged, how the USDA FDC entry is cross-referenced, and how the change is logged
        with the affected FDC ID and source URL.
      </p>

      <AuthorBox layer="legal" slug="disclaimer" />
    </article>
  );
}
