const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://caloriewize.com';

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem', position: i + 1, name: item.name, item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question', name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function nutritionSchema(name: string, food: {
  calories: number | null; protein: number | null; fat: number | null;
  carbs: number | null; fiber: number | null; sodium: number | null;
}) {
  return {
    '@context': 'https://schema.org', '@type': 'NutritionInformation',
    name: `${name} Nutrition Facts`,
    calories: food.calories ? `${food.calories} calories` : undefined,
    proteinContent: food.protein ? `${food.protein}g` : undefined,
    fatContent: food.fat ? `${food.fat}g` : undefined,
    carbohydrateContent: food.carbs ? `${food.carbs}g` : undefined,
    fiberContent: food.fiber ? `${food.fiber}g` : undefined,
    sodiumContent: food.sodium ? `${food.sodium}mg` : undefined,
    servingSize: '100g',
  };
}
