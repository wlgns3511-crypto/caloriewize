// HCU 2026-04-24 GSC rescue + cleanup submit for caloriewize.
//
// Context: 20 /compare/ URLs earned clicks in 28d GSC window (2026-03-24 ~
// 2026-04-21). Initial HCU cleanup (this deploy) cuts /compare/ to top-250
// + those 20 GSC winners — all preserved, none killed. This script pings
// IndexNow so Google refreshes the KEPT signal ahead of organic recrawl.
//
// Food slugs have internal dashes so reverse construction uses lastIndexOf
// of '-vs-'. For the 20 GSC slugs this is the real separator.

const HOST = 'caloriewize.com';
const KEY = '62a917988fd54513a177bc26cd430297';

const gscEvidence = [
  'apricots-raw-vs-goji-berries-dried',
  'beef-ground-90-lean-meat-10-fat-raw-vs-beef-ground-93-lean-meat-7-fat-raw',
  'alcoholic-beverage-beer-light-higher-alcohol-vs-snacks-potato-chips-made-from-dried-potatoes-reduced-fat',
  'apricots-raw-vs-snacks-popcorn-air-popped',
  'babyfood-juice-pear-vs-rice-crackers',
  'barley-malt-flour-vs-millet-flour',
  'barley-pearled-raw-vs-eggs-grade-a-large-egg-whole',
  'beef-ground-80-lean-meat-20-fat-patty-cooked-broiled-vs-blueberries-dried-sweetened',
  'bread-pumpernickel-vs-bread-white-wheat',
  'bread-white-commercially-prepared-includes-soft-bread-crumbs-vs-rice-white-medium-grain-raw-unenriched',
  'carrabbas-italian-grill-spaghetti-with-meat-sauce-vs-seeds-breadnut-tree-seeds-dried',
  'cheese-low-sodium-cheddar-or-colby-vs-hummus-home-prepared',
  'cherry-juice-tart-vs-grapefruit-juice-white-canned-or-bottled-unsweetened',
  'chicken-broiler-rotisserie-bbq-wing-meat-and-skin-vs-lamb-variety-meats-and-by-products-lungs-raw',
  'cookies-oatmeal-reduced-fat-vs-crackers-saltines-low-salt-includes-oyster-soda-soup',
  'cookies-raisin-soft-type-vs-snacks-tortilla-chips-plain-white-corn-salted',
  'crackers-saltines-includes-oyster-soda-soup-vs-snacks-tortilla-chips-plain-white-corn-salted',
  'cucumber-peeled-raw-vs-onions-red-raw',
  'cucumber-with-peel-raw-vs-vinegar-balsamic',
  'fast-foods-breakfast-burrito-with-egg-cheese-and-sausage-vs-fish-tuna-light-canned-in-oil-drained-solids',
];

const urls: string[] = [];
for (const slug of gscEvidence) {
  urls.push(`https://${HOST}/compare/${slug}/`);
  // Reverse: last -vs- is always the real separator for these 20 GSC slugs.
  const lastVs = slug.lastIndexOf('-vs-');
  if (lastVs > 0) {
    const a = slug.slice(0, lastVs);
    const b = slug.slice(lastVs + 4);
    urls.push(`https://${HOST}/compare/${b}-vs-${a}/`);
  }
}

(async () => {
  console.log(`[GSC-RESCUE] submitting ${urls.length} URLs as KEPT...`);
  urls.forEach((u) => console.log(`  ${u}`));
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: urls,
    }),
  });
  console.log(`status ${res.status} ${await res.text()}`);
})();
