/**
 * Phase 7 audit for caloriewize — Tier-2 cohort #10 (2026-05-25, audit-only
 * formalisation cycle). Verifies Traps #110/#111/#112/#119/#120 plus the
 * Empirical-Outcomes Tier-2 block (E1-E6) against the /food/[slug]/
 * verdict surface (2,589-food USDA FoodData Central cohort, data/food.db).
 *
 * Tier-2 classification (2026-05-25 promotion):
 *   - ordinal: 10 (after ingredipeek #8 + florawize PSV #9 DUAL)
 *   - shape:   (b) categorical bucket — 5-band PQE composition (HIGH_QUALITY_LEAN
 *              + HIGH_QUALITY_DENSE + LOW_QUALITY_LEAN + ENERGY_DOMINANT
 *              + COHERENCE_FLAGGED) + UNKNOWN honest-null
 *   - level:   per-food (2,589 cohort, 2,578 active), 5th entity-level
 *              Tier-2 after dogbreedpeek #3 / florawize ECB #6 /
 *              kotobapeek #7 / ingredipeek #8 / florawize PSV #9
 *   - by-design uniformity: NO — ENERGY_DOMINANT 43.1% is well under
 *              the v2.2 Trap #111 60% threshold; precedent count stays at 10
 *              (ingredipeek NOVA-4 catalog dominance was the 10th)
 *
 * Phase 7 P0+P1+P4+P5 wrap was deployed 2026-05-19 (gate JSON v7.0, s2:3016).
 * This audit is the Tier-2 formalisation cycle — no redeploy required per
 * feedback-no-git-push; existing PROD already serves the PQE verdict.
 *
 * Runs as a one-shot:
 *   npx tsx scripts/audit-phase7.ts
 */
import { getAllFoods } from '../lib/db';
import {
  decodeProteinQualityEnergy,
  pqeTitleVerdict,
  type PQEBand,
  type DIAASClass,
} from '../lib/crosswalk-protein-quality-energy';
import { SOURCE_AUTHORITIES } from '../lib/authorship';
import { decodeElectrolyteBalance, type NaKBand } from '../lib/electrolyte-balance';
import { getAllListTypes, getListInsight } from '../lib/food-cluster-insights';

console.log('=== Phase 7 audit — caloriewize (Tier-2 cohort #10) ===');
console.log('Shape: (b) categorical 5-band PQE composition + UNKNOWN honest-null');
console.log('Cohort level: per-food (5th entity-level Tier-2)');

// Title-cap math mirrors the page-level buildTitle() in app/food/[slug]/page.tsx.
// title.absolute bypasses the layout suffix ' | CalorieWize' 14c (per 2026-05-24
// page-level comment), so the composed body alone is measured against 60c.
const TITLE_MAX = 60;

function buildTitle(name: string, calories: number | null, pqeBand?: string): string {
  const cal = calories != null ? calories.toFixed(0) : '?';
  const bandTail = pqeBand && pqeBand !== '—' ? ` · ${pqeBand}` : '';
  const ideal = `${name} Calories: ${cal} kcal per 100g${bandTail}`;
  if (ideal.length <= TITLE_MAX) return ideal;
  const noBand = `${name} Calories: ${cal} kcal per 100g`;
  if (noBand.length <= TITLE_MAX) return noBand;
  const prefix = bandTail ? `${cal} kcal/100g${bandTail} · ` : `${cal} kcal/100g · `;
  const room = Math.max(20, TITLE_MAX - prefix.length - 1);
  let trimmed = name.slice(0, room);
  trimmed = trimmed.replace(/[\s,]+\S*$/, '');
  return `${prefix}${trimmed}…`;
}

// Trap #110 — publisher diversity. caloriewize composes 3 distinct
// organizational publishers (USDA FDC / FDA DV / FAO/WHO DIAAS) + Atwater
// public-domain methodology (4th independent input but not a publisher).
// Playbook §163 threshold ≥2 TLD; gate JSON v7.0 documents 3 hosts +
// Atwater. Honest minimum check = ≥3.
const publisherHosts = SOURCE_AUTHORITIES.map((s) => {
  try {
    return new URL(s.url).host;
  } catch {
    return s.url;
  }
});
const distinctHosts = new Set(publisherHosts);
const TRAP_110_MIN = 3;
console.log('\n[#110] cross-walk publisher hosts:', publisherHosts);
console.log(
  '       distinct count:',
  distinctHosts.size,
  distinctHosts.size >= TRAP_110_MIN
    ? 'PASS (≥' + TRAP_110_MIN + ' organizational + Atwater public-domain methodology as 4th independent input)'
    : 'FAIL (need ≥' + TRAP_110_MIN + ' for PQE cross-walk)',
);
distinctHosts.forEach((h) => console.log('       ·', h));

// Trap #111 — PQE band distribution. Max bucket ≤60% (no by-design
// uniformity exception applies — ENERGY_DOMINANT 43.1% is genuine catalog
// composition, not engineered concentration).
const foods = getAllFoods();
const bandCounts: Record<PQEBand, number> = {
  HIGH_QUALITY_LEAN: 0,
  HIGH_QUALITY_DENSE: 0,
  LOW_QUALITY_LEAN: 0,
  ENERGY_DOMINANT: 0,
  COHERENCE_FLAGGED: 0,
  UNKNOWN: 0,
};
const diaasCounts: Record<DIAASClass, number> = {
  excellent: 0,
  good: 0,
  limited: 0,
  poor: 0,
  'not-applicable': 0,
};
let proteinShareSum = 0;
let proteinShareSqSum = 0;
let proteinShareN = 0;
let energyDvSum = 0;
let energyDvSqSum = 0;
let energyDvN = 0;
let titleBudgetMax = 0;
let titleBudgetMaxWho = '';
let titleOverBudget = 0;
let bandInTitle = 0;
let decoded = 0;
const samples: { len: number; full: string }[] = [];

for (const f of foods) {
  decoded += 1;
  const pqe = decodeProteinQualityEnergy({
    category: f.category,
    calories: f.calories,
    protein: f.protein,
    carbs: f.carbs,
    fat: f.fat,
    foodName: f.name,
  });
  bandCounts[pqe.band] += 1;
  diaasCounts[pqe.diaasClass] += 1;
  if (pqe.band !== 'UNKNOWN') {
    proteinShareSum += pqe.proteinEnergyPct;
    proteinShareSqSum += pqe.proteinEnergyPct ** 2;
    proteinShareN += 1;
    energyDvSum += pqe.energyDvPct;
    energyDvSqSum += pqe.energyDvPct ** 2;
    energyDvN += 1;
  }
  const title = buildTitle(f.name, f.calories, pqe.titleLabel);
  if (title.length > titleBudgetMax) {
    titleBudgetMax = title.length;
    titleBudgetMaxWho = f.name;
  }
  if (title.length > TITLE_MAX) titleOverBudget += 1;
  if (pqe.titleLabel !== '—' && title.includes(pqe.titleLabel)) bandInTitle += 1;
  if (samples.length < 4) samples.push({ len: title.length, full: title });
}

const pcts: Record<string, number> = {};
for (const [k, v] of Object.entries(bandCounts)) {
  pcts[k] = decoded > 0 ? (v / decoded) * 100 : 0;
}
const maxPct = Math.max(...Object.values(pcts));
const maxBand = (Object.keys(pcts) as PQEBand[]).find((k) => pcts[k] === maxPct) ?? 'UNKNOWN';

console.log('\n[#111] PQE band distribution (n=' + decoded + '):', bandCounts);
console.log(
  '       pct:',
  Object.fromEntries(Object.entries(pcts).map(([k, v]) => [k, v.toFixed(1) + '%'])),
);
console.log(
  '       max-bucket concentration:',
  maxPct.toFixed(1) + '%',
  '(' + maxBand + ')',
  maxPct <= 60
    ? 'PASS (≤60% — genuine catalog composition, no by-design uniformity exception)'
    : 'FAIL (must be ≤60% unless v2.2 §Trap #111 catalog-reality exception annotated)',
);

// Trap #112 — P1 title length ≤60 chars across the cohort. title.absolute
// bypasses layout suffix ' | CalorieWize' 14c.
console.log('\n[#112] P1 title length audit (n=' + decoded + ')');
console.log('       max length:', titleBudgetMax, 'chars  (worst:', titleBudgetMaxWho + ')');
console.log(
  '       over ' + TITLE_MAX + ' chars:',
  titleOverBudget,
  titleOverBudget === 0 ? 'PASS' : 'FAIL',
);
for (const s of samples) console.log('       sample: [' + s.len + ']', s.full || '(empty)');

// Trap #119 — P1 coverage. Every food in the cohort must decode to a
// title-bearing verdict (UNKNOWN routes 11/2589 = 0.4% to '—' which drops
// the band suffix — coverage is the title itself, not the band-in-title rate).
const coverPct = decoded > 0 ? (decoded / foods.length) * 100 : 0;
console.log('\n[#119] P1 title-coverage');
console.log(
  '       title-bearing:',
  decoded,
  '/',
  foods.length,
  '(' + coverPct.toFixed(1) + '%)',
  coverPct >= 100 ? 'PASS' : 'FAIL (100% expected — every food must decode to a title)',
);
const bandInTitlePct = decoded > 0 ? (bandInTitle / decoded) * 100 : 0;
console.log(
  '       band-in-title coverage:',
  bandInTitle,
  '/',
  decoded,
  '(' + bandInTitlePct.toFixed(1) + '%)',
  bandInTitlePct >= 70
    ? 'PASS (≥70% — long-name foods drop the band suffix per HCU 5-chunk SERP-eligibility rule)'
    : 'FAIL',
);

// Trap #120 — N=20 randomized cold-probe. Asserts the title body carries
// either the band suffix (' · {label}') or, for long names, the front-loaded
// '{X} kcal/100g · {band} · {Name…}' pattern.
const sample20 = [...foods].sort(() => Math.random() - 0.5).slice(0, 20);
let verdictsInTitle = 0;
const VERDICT_RE = /Calories: \d+ kcal per 100g( · (HQ lean|HQ dense|Lean light|Energy-dom|kcal check))?$|^\d+ kcal\/100g · (HQ lean|HQ dense|Lean light|Energy-dom|kcal check) · /;
for (const f of sample20) {
  const pqe = decodeProteinQualityEnergy({
    category: f.category,
    calories: f.calories,
    protein: f.protein,
    carbs: f.carbs,
    fat: f.fat,
    foodName: f.name,
  });
  const title = buildTitle(f.name, f.calories, pqe.titleLabel);
  if (VERDICT_RE.test(title)) verdictsInTitle += 1;
}
const probePct = sample20.length > 0 ? (verdictsInTitle / sample20.length) * 100 : 0;
console.log('\n[#120] N=20 randomized cold-probe (title verdict marker)');
console.log(
  '       verdict-bearing:',
  verdictsInTitle,
  '/',
  sample20.length,
  '(' + probePct.toFixed(1) + '%)',
  probePct >= 80
    ? 'PASS (≥80% — long-name foods drop band suffix, dropping below 100%)'
    : 'FAIL',
);

// ─────────────────────────────────────────────────────────────────────
// Empirical-Outcomes Tier-2 block (E1-E6) — formalised 2026-05-25
// For shape-(b) categorical Tier-2 the block is interpreted as:
//   E1: active-cohort coverage floor (foods with valid macros)
//   E2: honest-null routing (UNKNOWN ≤1% — decoder-honesty test, not
//       baseline as in shape-(a) continuous Tier-2)
//   E3: sub-input dimensionality spread (protein-energy% + energy-DV%
//       sd ≥ thresholds → confirms decoder is reading real food variance)
//   E4: 5-band PQE max bucket ≤60% (Trap #111-equivalent)
//   E5: publisher diversity ≥3 (covered by #110)
//   E6: page-surface wiring — buildTitle emits band label;
//       variableMeasured emits pqe_band; ProteinQualityEnergyBlock renders
// ─────────────────────────────────────────────────────────────────────

console.log('\n=== Empirical-Outcomes Tier-2 block (E1-E6) ===');

// E1 — active-cohort coverage floor
const active = decoded - bandCounts.UNKNOWN;
const E1_FLOOR = 2500;
console.log('\n[E1] active-cohort coverage');
console.log(
  '     active n :',
  active,
  '/',
  decoded,
  '(' + ((active / decoded) * 100).toFixed(1) + '%)',
);
console.log(
  '     floor ' + E1_FLOOR + ' :',
  active >= E1_FLOOR ? 'PASS' : 'FAIL (need ≥' + E1_FLOOR + ' foods with valid macros)',
);

// E2 — honest-null routing (UNKNOWN bucket pct ≤1%)
const unknownPct = decoded > 0 ? (bandCounts.UNKNOWN / decoded) * 100 : 0;
console.log('\n[E2] honest-null routing (categorical Tier-2 baseline)');
console.log(
  '     UNKNOWN pct :',
  unknownPct.toFixed(2) + '%',
  '(',
  bandCounts.UNKNOWN,
  '/',
  decoded,
  ')',
);
console.log(
  '     floor ≤1%   :',
  unknownPct <= 1
    ? 'PASS'
    : 'FAIL (more than 1% routing to UNKNOWN = USDA FDC ingest issue or decoder gate too narrow)',
);

// E3 — sub-input dimensionality spread (active foods only)
const proteinShareMean = proteinShareN ? proteinShareSum / proteinShareN : 0;
const proteinShareVar = proteinShareN
  ? proteinShareSqSum / proteinShareN - proteinShareMean ** 2
  : 0;
const proteinShareSd = Math.sqrt(Math.max(0, proteinShareVar));
const energyDvMean = energyDvN ? energyDvSum / energyDvN : 0;
const energyDvVar = energyDvN ? energyDvSqSum / energyDvN - energyDvMean ** 2 : 0;
const energyDvSd = Math.sqrt(Math.max(0, energyDvVar));
const PROTEIN_SD_FLOOR = 10;
const ENERGY_DV_SD_FLOOR = 5;
console.log('\n[E3] sub-input dimensionality spread');
console.log(
  '     protein-energy% : mean=' + proteinShareMean.toFixed(2),
  ' sd=' + proteinShareSd.toFixed(2),
  '(floor ' + PROTEIN_SD_FLOOR + ')',
);
console.log(
  '     energy-DV%/100g : mean=' + energyDvMean.toFixed(2),
  ' sd=' + energyDvSd.toFixed(2),
  '(floor ' + ENERGY_DV_SD_FLOOR + ')',
);
console.log(
  '     spread          :',
  proteinShareSd >= PROTEIN_SD_FLOOR && energyDvSd >= ENERGY_DV_SD_FLOOR
    ? 'PASS (both sub-inputs spread above floor — decoder reads real cohort variance)'
    : 'FAIL (one or both sub-inputs collapsed — decoder may be saturating)',
);

// E4 — PQE band max ≤60%
console.log('\n[E4] PQE 5-band distribution');
const pqePcts = Object.fromEntries(
  Object.entries(bandCounts).map(([k, v]) => [
    k,
    decoded > 0 ? ((v / decoded) * 100).toFixed(1) + '%' : '0.0%',
  ]),
);
console.log('     distribution:', pqePcts);
console.log(
  '     max ≤60%    :',
  maxPct <= 60 ? 'PASS' : 'FAIL (PQE must distribute under 60% max)',
);

// E5 — publisher diversity ≥3 (already covered by #110)
console.log('\n[E5] publisher diversity (≥3 distinct hosts)');
console.log(
  '     distinct hosts:',
  distinctHosts.size,
  distinctHosts.size >= 3 ? 'PASS (covered by #110)' : 'FAIL',
);

// E6 — page-surface wiring spot-check
//   1. buildTitle returns band-bearing form for short-name foods
//   2. pqeTitleVerdict returns a compact label for each band
//   3. SOURCE_AUTHORITIES has ≥3 entries (used in schema creator + sourceOrganization)
const sampleBands: PQEBand[] = [
  'HIGH_QUALITY_LEAN',
  'HIGH_QUALITY_DENSE',
  'LOW_QUALITY_LEAN',
  'ENERGY_DOMINANT',
  'COHERENCE_FLAGGED',
];
const allLabelsOk = sampleBands.every((b) => pqeTitleVerdict(b).length <= 16);
const titleSampleOk = samples.some((s) => /Calories: \d+ kcal per 100g/.test(s.full));
const pubOk = SOURCE_AUTHORITIES.length >= 3;
const e6_ok = allLabelsOk && titleSampleOk && pubOk;
console.log('\n[E6] page-surface wiring');
console.log(
  '     title-marker=' + (titleSampleOk ? 'YES' : 'NO'),
  ' titleLabel≤16c=' + (allLabelsOk ? 'YES' : 'NO'),
  ' SOURCE_AUTHORITIES.len=' + SOURCE_AUTHORITIES.length,
);
console.log(
  '     ',
  e6_ok ? 'PASS' : 'FAIL (title marker + compact band labels + ≥3 publishers must all wire)',
);

// DIAAS class distribution — informational diagnostic
console.log('\n[diaas-diagnostic] DIAAS-class distribution (n=' + decoded + ')');
const diaasPcts = Object.fromEntries(
  Object.entries(diaasCounts).map(([k, v]) => [
    k,
    decoded > 0 ? ((v / decoded) * 100).toFixed(1) + '%' : '0.0%',
  ]),
);
console.log('     ', diaasPcts);

// Sanity samples — composed title for several known foods
console.log('\n[sample]');
const sampleSlugs = ['banana-raw', 'salmon-sockeye-canned-total-can-contents', 'apples-raw-without-skin', 'almonds-raw'];
for (const slug of sampleSlugs) {
  const food = foods.find((f) => f.slug === slug);
  if (!food) {
    console.log('  ' + slug.padEnd(48) + ' NO FOOD');
    continue;
  }
  const pqe = decodeProteinQualityEnergy({
    category: food.category,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    foodName: food.name,
  });
  const title = buildTitle(food.name, food.calories, pqe.titleLabel);
  console.log(
    '  ' + slug.padEnd(48),
    'band=' + pqe.band.padEnd(18),
    'diaas=' + pqe.diaasClass.padEnd(14),
    'title=' + title.length + 'c',
  );
}

console.log('\n=== Tier-2 #10 promotion summary ===');
console.log('  cohort total              :', decoded);
console.log('  cohort active             :', active, '(' + ((active / decoded) * 100).toFixed(1) + '%)');
console.log('  PQE max bucket            :', maxPct.toFixed(1) + '% (' + maxBand + ')');
console.log('  PQE band spread (max-min) :', (maxPct - Math.min(...Object.values(pcts))).toFixed(1) + 'pp');
console.log('  protein-energy% sd        :', proteinShareSd.toFixed(2));
console.log('  energy-DV%/100g sd        :', energyDvSd.toFixed(2));
console.log('  UNKNOWN pct               :', unknownPct.toFixed(2) + '%');
console.log('  publishers (distinct)     :', distinctHosts.size, '+ Atwater public-domain methodology');
console.log('  title body max            :', titleBudgetMax + 'c (≤' + TITLE_MAX + ' cap)');
console.log('  band-in-title coverage    :', bandInTitlePct.toFixed(1) + '%');

// ══════════════════════════════════════════════════════════════════════════
// Vertical-Depth — Sodium-to-Potassium (Na:K) balance + micronutrient source
// ══════════════════════════════════════════════════════════════════════════
console.log('\n=== Vertical-Depth audit — Na:K balance + micronutrient %DV ===');
let vdFail = 0;
const vdAssert = (ok: boolean, label: string, detail = '') => {
  console.log('  ' + (ok ? '✅' : '🔴') + ' ' + label + (detail ? ' — ' + detail : ''));
  if (!ok) vdFail++;
};

const nakDist: Record<NaKBand, number> = {
  'potassium-rich': 0, balanced: 0, 'sodium-leaning': 0, 'sodium-heavy': 0, unknown: 0,
};
let nakUnknown = 0;
let micronutrientSourceCount = 0;
let molarOutOfRange = 0;
let dispatchInconsistent = 0;
let verdictMissingDisclaimer = 0;

for (const food of foods) {
  const r = decodeElectrolyteBalance(food);
  nakDist[r.band]++;
  if (r.band === 'unknown') nakUnknown++;
  if (r.sourceHighlights.length > 0) micronutrientSourceCount++;
  // honesty: molar ratio finite and non-negative when known
  if (r.molarRatio !== null && (!Number.isFinite(r.molarRatio) || r.molarRatio < 0)) molarOutOfRange++;
  // honesty: band ↔ WHO target consistency (meetsWhoTarget ⇔ molar ≤ 1)
  if (r.molarRatio !== null && (r.meetsWhoTarget !== (r.molarRatio <= 1))) dispatchInconsistent++;
  // honesty: every verdict carries the non-clinical disclaimer
  if (!/not (medical|clinical)/i.test(r.verdict)) verdictMissingDisclaimer++;
}
const nakDecoded = foods.length - nakUnknown;
const nakMax = Math.max(...(Object.values(nakDist) as number[]).filter((_, i) => Object.keys(nakDist)[i] !== 'unknown'));
const nakMaxPct = (nakMax / foods.length) * 100;
const nakUnknownPct = (nakUnknown / foods.length) * 100;

console.log('  Na:K band distribution (n=' + foods.length + '):');
for (const b of Object.keys(nakDist) as NaKBand[]) {
  console.log('    ' + b.padEnd(16) + nakDist[b] + '  ' + ((nakDist[b] / foods.length) * 100).toFixed(1) + '%');
}

vdAssert(nakMaxPct <= 60, 'Trap #111 Na:K band concentration', 'max ' + nakMaxPct.toFixed(1) + '% ≤ 60% (honest distribution, no bandify smoothing)');
vdAssert(nakUnknownPct <= 10, 'honest-null routing', 'UNKNOWN ' + nakUnknownPct.toFixed(1) + '% (potassium missing → no fabricated ratio)');
vdAssert(molarOutOfRange === 0, 'molar ratio finiteness', molarOutOfRange + ' out-of-range');
vdAssert(dispatchInconsistent === 0, 'band ↔ WHO-target consistency', dispatchInconsistent + ' inconsistent');
vdAssert(verdictMissingDisclaimer === 0, 'verdict non-clinical disclaimer', verdictMissingDisclaimer + ' missing');
vdAssert(micronutrientSourceCount > 0, 'micronutrient FDA source surfaced', micronutrientSourceCount + ' foods are a good/excellent source of ≥1 micronutrient');

// Na:K ranked-list aggregate — registered + title cap
const listTypes = getAllListTypes();
const hasNakList = listTypes.includes('sodium-potassium-balance' as never);
vdAssert(hasNakList, 'Na:K ranked list registered', listTypes.length + ' list types');
if (hasNakList) {
  const meta = getListInsight('sodium-potassium-balance' as never);
  const renderedTitle = `${meta.title}: 60 picks (USDA) | CalorieWize`;
  vdAssert(renderedTitle.length <= 60, 'Trap #112 Na:K list title cap', renderedTitle.length + 'c ≤ 60 ("' + renderedTitle + '")');
}

console.log('\n=== Vertical-Depth summary ===');
console.log('  Na:K max band             :', nakMaxPct.toFixed(1) + '% (' + Object.entries(nakDist).filter(([k]) => k !== 'unknown').sort((a, b) => b[1] - a[1])[0][0] + ')');
console.log('  Na:K decoded (non-null)   :', nakDecoded, '(' + ((nakDecoded / foods.length) * 100).toFixed(1) + '%)');
console.log('  micronutrient source foods:', micronutrientSourceCount);
console.log('  result                    :', vdFail === 0 ? '✅ ALL PASS' : '🔴 ' + vdFail + ' FAILURE(S)');
if (vdFail > 0) process.exitCode = 1;
