import { PUBLISHER, EDITORIAL_TEAM } from './authorship';

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
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function itemListSchema(name: string, url: string, items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: `${SITE_URL}${url}`,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: `${SITE_URL}${item.url}`,
    })),
  };
}

export function datasetSchema(name: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    url: `${SITE_URL}${url}`,
    creator: { '@type': 'Organization', name: 'CalorieWize', url: SITE_URL },
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    temporalCoverage: `2023/${new Date().getFullYear()}`,
    distribution: { '@type': 'DataDownload', encodingFormat: 'text/html', contentUrl: `${SITE_URL}${url}` },
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

export function articleSchema(post: { title: string; description: string; slug: string; urlPath?: string; publishedAt: string; updatedAt?: string; category?: string }) {
  const articlePath = post.urlPath ?? (post.slug.includes('/') ? `/${post.slug.replace(/^\/+|\/+$/g, '')}/` : `/blog/${post.slug}/`);
  const url = `${SITE_URL}${articlePath}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { '@type': 'Organization', name: 'CalorieWize', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'CalorieWize', url: SITE_URL },
    mainEntityOfPage: url,
    ...(post.category && { articleSection: post.category }),
  };
}
