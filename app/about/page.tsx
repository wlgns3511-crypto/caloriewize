import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About CalorieWize",
  description: "Learn about CalorieWize, our mission, and data sources.",
};

export default function AboutPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">About CalorieWize</h1>

      <p>
        CalorieWize is a free resource for anyone looking to understand the nutritional content of the food they eat.
        We provide calorie counts and detailed nutrition facts for thousands of foods, making it easy to track your
        diet, compare foods side by side, and make healthier choices.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Our Mission</h2>
      <p>
        Understanding what you eat is the first step toward a healthier lifestyle. Our mission is to make nutrition
        information accessible, accurate, and easy to understand for everyone. Whether you are counting calories,
        tracking macronutrients, or simply want to know what is in your food, CalorieWize provides the data you need
        in a clean, straightforward format.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Sources</h2>
      <p>
        All nutrition data on this site comes from the <strong>USDA FoodData Central</strong> database, maintained by
        the U.S. Department of Agriculture. FoodData Central is the most comprehensive food composition database in
        the United States, providing nutrient profiles for thousands of foods. All values are displayed per 100g
        serving for consistent comparison. We update our data as new USDA releases become available.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact Us</h2>
      <p>
        Have questions or feedback? Visit our <a href="/contact" className="text-orange-600 hover:underline">Contact page</a> to get in touch.
      </p>
    </article>
  );
}
