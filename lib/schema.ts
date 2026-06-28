import {
  PUBLISHER,
  EDITORIAL_TEAM,
  SOURCE_AUTHORITIES,
  SITE_REVIEWED,
  USDA_DATA_REVIEWED,
} from './authorship';

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

/**
 * Whitespace-collapse + 280-char cap for schema.org Dataset descriptions.
 * Long descriptions with embedded newlines fail Google Rich Results validation.
 */
export function normalizeDatasetDescription(raw: string): string {
  const collapsed = raw.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= 280) return collapsed;
  return collapsed.slice(0, 277).replace(/\s+\S*$/, '') + '…';
}

export function datasetSchema(
  name: string,
  description: string,
  url: string,
  opts?: { pqeBand?: string; extraVariableMeasured?: (string | Record<string, unknown>)[] }
) {
  const year = new Date().getFullYear();
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description: normalizeDatasetDescription(description),
    url: `${SITE_URL}${url}`,
    // 2026-05-19 (Phase 7 P4) — creator is now the full SOURCE_AUTHORITIES
    // array so the Dataset honestly attributes the Protein-Quality Energy
    // tier composition: USDA FDC (per-100g macros) + FDA DV (energy anchor)
    // + FAO/WHO DIAAS (protein-quality class). Previously only the first
    // entry was creator, which under-counted the composition. Mitigates
    // Trap #117 (creator = portfolio publisher only).
    creator: SOURCE_AUTHORITIES,
    publisher: {
      '@type': 'Organization',
      name: PUBLISHER.name,
      url: PUBLISHER.url,
    },
    // reviewedBy: editorial team (the people who audited the page).
    // Separated from sourceOrganization so the schema distinguishes who
    // verified from who supplied the underlying rows.
    reviewedBy: {
      '@type': 'Organization',
      name: EDITORIAL_TEAM.name,
      url: EDITORIAL_TEAM.url,
    },
    // sourceOrganization: the actual DB-row + verdict backing for the
    // dataset. Same list as creator — the composition publishers are also
    // the data sources.
    sourceOrganization: SOURCE_AUTHORITIES,
    isBasedOn: SOURCE_AUTHORITIES.map((s) => s.url),
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    temporalCoverage: `2023-01/${year}`,
    dateModified: SITE_REVIEWED,
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'text/html',
      contentUrl: `${SITE_URL}${url}`,
    },
    // variableMeasured surfaces the PQE composition outputs alongside the
    // raw per-100g macros so consumers can see the composed tier exists.
    variableMeasured: [
      'calories_per_100g',
      'protein_per_100g',
      'carbohydrates_per_100g',
      'fat_per_100g',
      'fiber_per_100g',
      'pqe_band',
      'atwater_coherence_ratio',
      'diaas_class',
      'fda_daily_value_energy_share',
      ...(opts?.pqeBand ? [`pqe_tier_${opts.pqeBand}`] : []),
      ...(opts?.extraVariableMeasured ?? []),
    ],
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
