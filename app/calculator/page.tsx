import type { Metadata } from "next";
import { TDEECalculator } from "@/components/TDEECalculator";

export const metadata: Metadata = {
  title: "TDEE Calculator — How Many Calories Do You Need?",
  description:
    "Calculate your Total Daily Energy Expenditure (TDEE) and Basal Metabolic Rate (BMR). Get personalized calorie targets for weight loss, maintenance, and weight gain with macro breakdowns.",
  alternates: { canonical: "/calculator" },
};

export default function CalculatorPage() {
  return (
    <div>
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">TDEE &amp; Calorie Calculator</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Find out how many calories you burn each day and get personalized macro
          targets for your fitness goals. Uses the Mifflin-St Jeor equation.
        </p>
      </section>

      <div className="max-w-xl mx-auto mb-12">
        <TDEECalculator />
      </div>

      <section className="max-w-3xl mx-auto mb-8">
        <h2 className="text-xl font-bold mb-3">What is TDEE?</h2>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          Total Daily Energy Expenditure (TDEE) is the total number of calories
          your body burns in a day, including your Basal Metabolic Rate (BMR),
          physical activity, and the thermic effect of food. Knowing your TDEE
          helps you set the right calorie intake for weight loss, maintenance, or
          muscle gain.
        </p>
        <h2 className="text-xl font-bold mb-3">How is BMR Calculated?</h2>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          We use the Mifflin-St Jeor equation, which research has shown to be
          the most reliable formula for estimating BMR. Your BMR represents the
          calories your body needs at complete rest to maintain basic functions
          like breathing, circulation, and cell production.
        </p>
        <h2 className="text-xl font-bold mb-3">Understanding Your Results</h2>
        <ul className="text-slate-600 text-sm space-y-2 list-disc pl-5">
          <li><strong>Weight Loss:</strong> Eating 500 calories below your TDEE leads to roughly 1 pound of fat loss per week.</li>
          <li><strong>Maintenance:</strong> Eating at your TDEE keeps your weight stable.</li>
          <li><strong>Weight Gain:</strong> Eating 500 calories above your TDEE supports muscle growth when combined with strength training.</li>
        </ul>
      </section>
    </div>
  );
}
