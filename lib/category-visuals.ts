/**
 * Visual identity for each USDA FoodData Central category.
 *
 * HONEST CONTRACT: this file uses universal Unicode emoji glyphs (rendered
 * natively by the user's OS — Apple Color Emoji, Segoe UI Emoji, Noto Color
 * Emoji) as **category symbols**, not as fabricated photographs of foods.
 * The 25 entries below cover every category slug present in food.db, mapped
 * to a representative emoji and a Tailwind colour tone keyed to common food
 * imagery (red for meats, green for produce, sky/blue for fish & beverages,
 * yellow for grains/dairy, amber/rose for baked goods + sweets).
 *
 * Why emoji rather than real photographs:
 *  - Apple/Google/Microsoft emoji glyphs ship with every modern OS — no
 *    licensing risk, no broken-image fallback, instant render.
 *  - Photographs of "fruits" or "vegetables" generalise poorly (a strawberry
 *    photo cannot represent the whole fruits category, but the 🍓 glyph
 *    reads as a symbol of "fruit-class foods" universally).
 *  - Self-hosting 25 curated CC-BY photographs would add ~2 MB of static
 *    assets and 25 separate attribution lines per page; the symbol approach
 *    keeps the category surface zero-bandwidth and zero-attribution.
 *
 * If/when we want real per-food photographs we'd attach them to specific
 * /food/[slug] pages (one food = one verifiable photo), not aggregate to
 * categories (one category covers 50–800 foods with wildly different looks).
 */

export interface CategoryVisual {
  emoji: string;
  /** Tailwind 'from-{color}-100' shade for gradient start */
  gradFrom: string;
  /** Tailwind 'to-{color}-50' shade for gradient end */
  gradTo: string;
  /** Tailwind 'border-{color}-200' for the card ring */
  ring: string;
  /** Tailwind 'text-{color}-700' for in-card accent text */
  accent: string;
  /** Plain-language family label (e.g. "Animal protein", "Produce") */
  family: string;
}

// Default fallback for any slug not in the dict (shouldn't fire — all 25
// USDA categories are listed below).
export const FALLBACK_VISUAL: CategoryVisual = {
  emoji: '🍽️',
  gradFrom: 'from-slate-100',
  gradTo: 'to-slate-50',
  ring: 'border-slate-200',
  accent: 'text-slate-700',
  family: 'Mixed',
};

export const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  'american-indianalaska-native-foods': {
    emoji: '🌽', gradFrom: 'from-amber-100', gradTo: 'to-yellow-50',
    ring: 'border-amber-200', accent: 'text-amber-800', family: 'Traditional',
  },
  'baby-foods': {
    emoji: '🍼', gradFrom: 'from-sky-100', gradTo: 'to-blue-50',
    ring: 'border-sky-200', accent: 'text-sky-800', family: 'Infant nutrition',
  },
  'baked-products': {
    emoji: '🥐', gradFrom: 'from-amber-100', gradTo: 'to-orange-50',
    ring: 'border-amber-200', accent: 'text-amber-800', family: 'Baked',
  },
  'beef-products': {
    emoji: '🥩', gradFrom: 'from-red-100', gradTo: 'to-rose-50',
    ring: 'border-red-200', accent: 'text-red-800', family: 'Animal protein',
  },
  'beverages': {
    emoji: '🥤', gradFrom: 'from-blue-100', gradTo: 'to-sky-50',
    ring: 'border-blue-200', accent: 'text-blue-800', family: 'Drinks',
  },
  'breakfast-cereals': {
    emoji: '🥣', gradFrom: 'from-yellow-100', gradTo: 'to-amber-50',
    ring: 'border-yellow-200', accent: 'text-yellow-800', family: 'Grains',
  },
  'cereal-grains-and-pasta': {
    emoji: '🌾', gradFrom: 'from-yellow-100', gradTo: 'to-amber-50',
    ring: 'border-yellow-200', accent: 'text-yellow-800', family: 'Grains',
  },
  'dairy-and-egg-products': {
    emoji: '🧀', gradFrom: 'from-yellow-100', gradTo: 'to-amber-50',
    ring: 'border-yellow-200', accent: 'text-yellow-800', family: 'Dairy',
  },
  'fast-foods': {
    emoji: '🍔', gradFrom: 'from-orange-100', gradTo: 'to-red-50',
    ring: 'border-orange-200', accent: 'text-orange-800', family: 'Prepared',
  },
  'fats-and-oils': {
    emoji: '🫒', gradFrom: 'from-lime-100', gradTo: 'to-yellow-50',
    ring: 'border-lime-200', accent: 'text-lime-800', family: 'Lipids',
  },
  'finfish-and-shellfish-products': {
    emoji: '🐟', gradFrom: 'from-sky-100', gradTo: 'to-cyan-50',
    ring: 'border-sky-200', accent: 'text-sky-800', family: 'Seafood',
  },
  'fruits-and-fruit-juices': {
    emoji: '🍓', gradFrom: 'from-rose-100', gradTo: 'to-pink-50',
    ring: 'border-rose-200', accent: 'text-rose-800', family: 'Produce',
  },
  'lamb-veal-and-game-products': {
    emoji: '🍖', gradFrom: 'from-red-100', gradTo: 'to-rose-50',
    ring: 'border-red-200', accent: 'text-red-800', family: 'Animal protein',
  },
  'legumes-and-legume-products': {
    emoji: '🫘', gradFrom: 'from-amber-100', gradTo: 'to-yellow-50',
    ring: 'border-amber-200', accent: 'text-amber-800', family: 'Plant protein',
  },
  'meals-entrees-and-side-dishes': {
    emoji: '🍽️', gradFrom: 'from-stone-100', gradTo: 'to-amber-50',
    ring: 'border-stone-200', accent: 'text-stone-800', family: 'Prepared',
  },
  'nut-and-seed-products': {
    emoji: '🥜', gradFrom: 'from-amber-100', gradTo: 'to-yellow-50',
    ring: 'border-amber-200', accent: 'text-amber-800', family: 'Plant protein',
  },
  'pork-products': {
    emoji: '🥓', gradFrom: 'from-rose-100', gradTo: 'to-pink-50',
    ring: 'border-rose-200', accent: 'text-rose-800', family: 'Animal protein',
  },
  'poultry-products': {
    emoji: '🍗', gradFrom: 'from-amber-100', gradTo: 'to-orange-50',
    ring: 'border-amber-200', accent: 'text-amber-800', family: 'Animal protein',
  },
  'restaurant-foods': {
    emoji: '🍴', gradFrom: 'from-stone-100', gradTo: 'to-slate-50',
    ring: 'border-stone-200', accent: 'text-stone-800', family: 'Prepared',
  },
  'sausages-and-luncheon-meats': {
    emoji: '🌭', gradFrom: 'from-red-100', gradTo: 'to-rose-50',
    ring: 'border-red-200', accent: 'text-red-800', family: 'Animal protein',
  },
  'snacks': {
    emoji: '🍿', gradFrom: 'from-yellow-100', gradTo: 'to-amber-50',
    ring: 'border-yellow-200', accent: 'text-yellow-800', family: 'Prepared',
  },
  'soups-sauces-and-gravies': {
    emoji: '🍲', gradFrom: 'from-orange-100', gradTo: 'to-amber-50',
    ring: 'border-orange-200', accent: 'text-orange-800', family: 'Prepared',
  },
  'spices-and-herbs': {
    emoji: '🌿', gradFrom: 'from-emerald-100', gradTo: 'to-lime-50',
    ring: 'border-emerald-200', accent: 'text-emerald-800', family: 'Seasonings',
  },
  'sweets': {
    emoji: '🍰', gradFrom: 'from-pink-100', gradTo: 'to-rose-50',
    ring: 'border-pink-200', accent: 'text-pink-800', family: 'Confections',
  },
  'vegetables-and-vegetable-products': {
    emoji: '🥦', gradFrom: 'from-emerald-100', gradTo: 'to-green-50',
    ring: 'border-emerald-200', accent: 'text-emerald-800', family: 'Produce',
  },
};

export function getCategoryVisual(slug: string): CategoryVisual {
  return CATEGORY_VISUALS[slug] ?? FALLBACK_VISUAL;
}
