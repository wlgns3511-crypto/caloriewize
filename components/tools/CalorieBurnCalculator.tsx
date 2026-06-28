"use client";

import { useState } from "react";

interface CalorieBurnCalculatorProps {
  foodName: string;
  caloriesPer100g: number | null;
}

export function CalorieBurnCalculator({
  foodName,
  caloriesPer100g,
}: CalorieBurnCalculatorProps) {
  const [weight, setWeight] = useState(70); // in kg
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [servingSize, setServingSize] = useState(100); // in grams

  const cal100g = caloriesPer100g ?? 0;
  const totalCalories = (servingSize / 100) * cal100g;

  // Convert displayed weight to kg for calculations
  const weightInKg = weightUnit === "lbs" ? weight / 2.20462 : weight;

  // MET values
  // Formula: mins = calories / (MET * 3.5 * weight_kg / 200)
  const calculateMins = (met: number) => {
    if (totalCalories <= 0 || weightInKg <= 0) return 0;
    const caloriesPerMin = (met * 3.5 * weightInKg) / 200;
    return Math.max(1, Math.round(totalCalories / caloriesPerMin));
  };

  const activities = [
    {
      name: "Walking",
      met: 3.0,
      description: "Moderate pace (3.0 mph)",
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 5H9.5a3.5 3.5 0 000 7H11v8m5-15V7m0 0v8m0-8h1.5a3.5 3.5 0 010 7H16" />
        </svg>
      ),
      color: "border-emerald-100 bg-emerald-50/50 text-emerald-900",
    },
    {
      name: "Jogging",
      met: 8.0,
      description: "Steady run (5.0 mph)",
      icon: (
        <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "border-rose-100 bg-rose-50/50 text-rose-900",
    },
    {
      name: "Bicycling",
      met: 6.0,
      description: "Moderate effort",
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: "border-blue-100 bg-blue-50/50 text-blue-900",
    },
    {
      name: "Swimming",
      met: 7.0,
      description: "Moderate laps",
      icon: (
        <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      color: "border-cyan-100 bg-cyan-50/50 text-cyan-900",
    },
  ];

  const handleUnitToggle = (unit: "kg" | "lbs") => {
    if (unit === weightUnit) return;
    setWeightUnit(unit);
    if (unit === "lbs") {
      setWeight(Math.round(weight * 2.20462));
    } else {
      setWeight(Math.round(weight / 2.20462));
    }
  };

  const walkMins = calculateMins(3.0);
  const runMins = calculateMins(8.0);

  return (
    <section className="not-prose border border-orange-200 rounded-xl p-5 bg-gradient-to-br from-orange-50/30 to-orange-100/20 mb-8">
      <h3 className="text-lg font-bold text-orange-950 mb-1">Calorie Burn Calculator</h3>
      <p className="text-sm text-slate-600 mb-5">
        See how long you need to exercise to burn off a serving of {foodName}.
      </p>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        {/* Slider: Body Weight */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-semibold text-slate-700">Your weight</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-orange-800">{weight} {weightUnit}</span>
              <div className="inline-flex rounded-md shadow-sm text-xs" role="group">
                <button
                  type="button"
                  onClick={() => handleUnitToggle("kg")}
                  className={`px-2 py-1 font-medium rounded-l-md border border-slate-200 ${
                    weightUnit === "kg"
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  kg
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitToggle("lbs")}
                  className={`px-2 py-1 font-medium rounded-r-md border border-l-0 border-slate-200 ${
                    weightUnit === "lbs"
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  lbs
                </button>
              </div>
            </div>
          </div>
          <input
            type="range"
            min={weightUnit === "kg" ? 40 : 90}
            max={weightUnit === "kg" ? 150 : 330}
            step={1}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-orange-600 bg-slate-200"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>{weightUnit === "kg" ? "40 kg" : "90 lbs"}</span>
            <span>{weightUnit === "kg" ? "150 kg" : "330 lbs"}</span>
          </div>
        </div>

        {/* Slider: Serving Size */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-semibold text-slate-700">Serving size</span>
            <span className="font-bold text-orange-800">{servingSize}g</span>
          </div>
          <input
            type="range"
            min={10}
            max={500}
            step={10}
            value={servingSize}
            onChange={(e) => setServingSize(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-orange-600 bg-slate-200"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>10g</span>
            <span>500g</span>
          </div>
        </div>
      </div>

      {/* Summary Box */}
      {totalCalories > 0 && (
        <div className="bg-white/80 border border-orange-100 rounded-lg p-3 text-sm text-slate-700 mb-5 leading-relaxed">
          👉 A <strong className="text-slate-900">{servingSize}g</strong> serving of {foodName} contains approximately{" "}
          <strong className="text-orange-700">{totalCalories.toFixed(0)} kcal</strong>. 
          To burn this off, a {weight} {weightUnit} person would need to walk for{" "}
          <strong className="text-slate-900">{walkMins} minutes</strong> or jog for{" "}
          <strong className="text-slate-900">{runMins} minutes</strong>.
        </div>
      )}

      {/* Activities Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {activities.map((act) => {
          const duration = calculateMins(act.met);
          return (
            <div key={act.name} className={`flex flex-col items-center text-center p-3 rounded-lg border ${act.color}`}>
              <div className="mb-1.5">{act.icon}</div>
              <div className="text-xs text-slate-500 font-medium mb-1">{act.name}</div>
              <div className="text-2xl font-black mb-0.5">
                {caloriesPer100g === null || caloriesPer100g === 0 ? "—" : `${duration}m`}
              </div>
              <div className="text-[10px] opacity-75">{act.description}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-[10px] text-slate-400 text-center">
        MET = Metabolic Equivalent of Task. Calculations based on standard metabolic equations (MET × 3.5 × weight in kg / 200 = calories burned per minute). Actual energy expenditure varies.
      </div>
    </section>
  );
}
