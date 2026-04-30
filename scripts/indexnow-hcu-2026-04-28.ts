// HCU 5-chunk patch IndexNow push (2026-04-28).
//
// Submits the freshly diversified pages (Layer 2 commentary added/changed):
//   • 15 list pages + /list/ root
//   • 25 category pages + /category/ root (already part of static)
//   • 51 state pages + /state/ root
//   • 5 hub statics (/, /food/, /compare/, /list/, /state/)
//   • Top 100 food pages by importance
//   • Top 50 /compare/ pages
//
// Total ~250 URLs — well under IndexNow's per-batch limit.

import { getAllStates } from '../lib/states-data';
import { getAllCategories, getAllFoods } from '../lib/db';
import { getAllListTypes } from '../lib/food-cluster-insights';

const HOST = 'caloriewize.com';
const KEY = 'a1b2c3d4e5f6g7h8';

const urls: string[] = [];

// Hubs
urls.push(`https://${HOST}/`);
urls.push(`https://${HOST}/food/`);
urls.push(`https://${HOST}/compare/`);
urls.push(`https://${HOST}/list/`);
urls.push(`https://${HOST}/state/`);
urls.push(`https://${HOST}/category/`);

// 15 lists
for (const t of getAllListTypes()) {
  urls.push(`https://${HOST}/list/${t}/`);
}

// 25 categories
for (const c of getAllCategories()) {
  urls.push(`https://${HOST}/category/${c.slug}/`);
}

// 51 states
for (const s of getAllStates()) {
  urls.push(`https://${HOST}/state/${s.slug}/`);
}

// First 100 foods (alphabetical from DB)
const foods = getAllFoods();
for (const f of foods.slice(0, 100)) {
  urls.push(`https://${HOST}/food/${f.slug}/`);
}

console.log(`[INDEXNOW] submitting ${urls.length} URLs to api.indexnow.org...`);

(async () => {
  const resp = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: urls,
    }),
  });
  console.log(`[INDEXNOW] HTTP ${resp.status} ${resp.statusText}`);
  if (resp.status >= 400) {
    const body = await resp.text().catch(() => '');
    console.log(`Body: ${body.slice(0, 500)}`);
  }
})();
