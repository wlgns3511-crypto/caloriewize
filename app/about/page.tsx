import type { Metadata } from "next";
import { EditorNote } from "@/components/EditorNote";
import { CrossSiteLinks } from "@/components/CrossSiteLinks";

const desc = "Learn about CalorieWize — free nutrition data for 2,500+ foods powered by USDA FoodData Central.";

export const metadata: Metadata = {
  title: "About CalorieWize",
  description: desc,
  alternates: { canonical: "/about/" },
  openGraph: { title: "About CalorieWize", description: desc, url: "/about/" },
};

export default function AboutPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'WebPage', name: 'About CalorieWize',
        description: desc, url: 'https://caloriewize.com/about/',
        isPartOf: { '@type': 'WebSite', name: 'CalorieWize', url: 'https://caloriewize.com' },
      }) }} />
      <h1 className="text-3xl font-bold text-orange-600 mb-6">About CalorieWize</h1>

      <EditorNote note="CalorieWize is part of the DataPeek Facts network — a collection of 30+ free data tools powered by official government and institutional sources." />

      <p>
        CalorieWize is a free resource for anyone looking to understand the nutritional content of the food they eat.
        We provide calorie counts and detailed nutrition facts for 2,500+ foods, making it easy to track your
        diet, compare foods side by side, and make healthier choices.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Our Mission</h2>
      <p>
        Understanding what you eat is the first step toward a healthier lifestyle. Our mission is to make nutrition
        information accessible, accurate, and easy to understand for everyone.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">The DataPeek Network</h2>
      <p>
        CalorieWize is part of <a href="https://datapeekfacts.com" className="text-orange-600 hover:underline">DataPeek Facts</a>,
        a network of specialized data platforms covering nutrition, salaries, cost of living, healthcare, education, housing, and more — all built on official data sources.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Sources</h2>
      <p>
        All nutrition data comes from the <strong>USDA FoodData Central</strong> database, maintained by the U.S. Department of Agriculture.
        All values are displayed per 100g serving for consistent comparison. See our <a href="/methodology/" className="text-orange-600 hover:underline">Methodology</a> for full details.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact Us</h2>
      <p>
        Have questions or feedback? Visit our <a href="/contact/" className="text-orange-600 hover:underline">Contact page</a>.
      </p>

      <CrossSiteLinks current="CalorieWize" />
    </article>
  );
}
