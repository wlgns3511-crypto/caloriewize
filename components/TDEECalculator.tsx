"use client";
import { useState, useMemo } from "react";

type Gender = "male" | "female";
type HeightUnit = "imperial" | "metric";
type WeightUnit = "lbs" | "kg";
type ActivityLevel = "sedentary" | "light" | "moderate" | "very_active" | "extra_active";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, { label: string; desc: string; factor: number }> = {
  sedentary: { label: "Sedentary", desc: "Little or no exercise", factor: 1.2 },
  light: { label: "Lightly Active", desc: "Light exercise 1-3 days/week", factor: 1.375 },
  moderate: { label: "Moderately Active", desc: "Moderate exercise 3-5 days/week", factor: 1.55 },
  very_active: { label: "Very Active", desc: "Hard exercise 6-7 days/week", factor: 1.725 },
  extra_active: { label: "Extra Active", desc: "Very hard exercise or physical job", factor: 1.9 },
};

function calcBMR(gender: Gender, weightKg: number, heightCm: number, age: number): number {
  if (gender === "male") return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

function calcMacros(calories: number, label: string) {
  const proteinCal = calories * 0.3;
  const carbsCal = calories * 0.4;
  const fatCal = calories * 0.3;
  return {
    label,
    calories: Math.round(calories),
    protein: Math.round(proteinCal / 4),
    carbs: Math.round(carbsCal / 4),
    fat: Math.round(fatCal / 9),
  };
}

export function TDEECalculator() {
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<Gender>("male");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("imperial");
  const [heightFt, setHeightFt] = useState<string>("");
  const [heightIn, setHeightIn] = useState<string>("");
  const [heightCm, setHeightCm] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("lbs");
  const [weight, setWeight] = useState<string>("");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [calculated, setCalculated] = useState(false);

  const results = useMemo(() => {
    const ageNum = parseInt(age);
    const weightNum = parseFloat(weight);
    if (!ageNum || !weightNum || ageNum < 1 || ageNum > 120) return null;

    let heightCmVal: number;
    if (heightUnit === "imperial") {
      const ft = parseInt(heightFt);
      const inches = parseInt(heightIn) || 0;
      if (!ft) return null;
      heightCmVal = (ft * 12 + inches) * 2.54;
    } else {
      heightCmVal = parseFloat(heightCm);
      if (!heightCmVal) return null;
    }

    const weightKg = weightUnit === "lbs" ? weightNum * 0.453592 : weightNum;
    const bmr = calcBMR(gender, weightKg, heightCmVal, ageNum);
    const tdee = bmr * ACTIVITY_MULTIPLIERS[activity].factor;

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      lose: calcMacros(tdee - 500, "Weight Loss"),
      maintain: calcMacros(tdee, "Maintenance"),
      gain: calcMacros(tdee + 500, "Weight Gain"),
    };
  }, [age, gender, heightUnit, heightFt, heightIn, heightCm, weightUnit, weight, activity]);

  const handleCalculate = () => {
    setCalculated(true);
  };

  const showResults = calculated && results;

  return (
    <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
        <h2 className="text-xl font-bold text-white">TDEE Calculator</h2>
        <p className="text-orange-100 text-sm mt-1">Calculate your Total Daily Energy Expenditure</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
          <input
            type="number"
            min="1"
            max="120"
            value={age}
            onChange={(e) => { setAge(e.target.value); setCalculated(false); }}
            placeholder="25"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
          <div className="flex gap-2">
            {(["male", "female"] as Gender[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => { setGender(g); setCalculated(false); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${gender === g ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {g === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </div>

        {/* Height */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-slate-700">Height</label>
            <button
              type="button"
              onClick={() => { setHeightUnit(heightUnit === "imperial" ? "metric" : "imperial"); setCalculated(false); }}
              className="text-xs text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              Switch to {heightUnit === "imperial" ? "cm" : "ft/in"}
            </button>
          </div>
          {heightUnit === "imperial" ? (
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={heightFt}
                  onChange={(e) => { setHeightFt(e.target.value); setCalculated(false); }}
                  placeholder="5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
                <span className="text-xs text-slate-400 mt-0.5 block">feet</span>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={heightIn}
                  onChange={(e) => { setHeightIn(e.target.value); setCalculated(false); }}
                  placeholder="10"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
                <span className="text-xs text-slate-400 mt-0.5 block">inches</span>
              </div>
            </div>
          ) : (
            <input
              type="number"
              min="50"
              max="250"
              value={heightCm}
              onChange={(e) => { setHeightCm(e.target.value); setCalculated(false); }}
              placeholder="178"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          )}
        </div>

        {/* Weight */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-slate-700">Weight</label>
            <button
              type="button"
              onClick={() => { setWeightUnit(weightUnit === "lbs" ? "kg" : "lbs"); setCalculated(false); }}
              className="text-xs text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              Switch to {weightUnit === "lbs" ? "kg" : "lbs"}
            </button>
          </div>
          <input
            type="number"
            min="1"
            value={weight}
            onChange={(e) => { setWeight(e.target.value); setCalculated(false); }}
            placeholder={weightUnit === "lbs" ? "160" : "73"}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
          <span className="text-xs text-slate-400 mt-0.5 block">{weightUnit}</span>
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Activity Level</label>
          <div className="space-y-1.5">
            {(Object.entries(ACTIVITY_MULTIPLIERS) as [ActivityLevel, typeof ACTIVITY_MULTIPLIERS[ActivityLevel]][]).map(([key, val]) => (
              <button
                key={key}
                type="button"
                onClick={() => { setActivity(key); setCalculated(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${activity === key ? "bg-orange-50 border-orange-400 border" : "border border-slate-200 hover:bg-slate-50"}`}
              >
                <span className={`font-medium ${activity === key ? "text-orange-700" : "text-slate-700"}`}>{val.label}</span>
                <span className="text-xs text-slate-400 ml-2">{val.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Calculate Button */}
        <button
          type="button"
          onClick={handleCalculate}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer"
        >
          Calculate TDEE
        </button>

        {/* Results */}
        {calculated && !results && (
          <p className="text-sm text-red-500 text-center">Please fill in all fields with valid values.</p>
        )}

        {showResults && (
          <div className="space-y-5 pt-2">
            {/* BMR & TDEE */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-50 rounded-lg p-4 text-center">
                <div className="text-xs text-slate-500 uppercase tracking-wider">BMR</div>
                <div className="text-2xl font-bold text-amber-600">{results.bmr}</div>
                <div className="text-xs text-slate-400">cal/day</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-xs text-slate-500 uppercase tracking-wider">TDEE</div>
                <div className="text-2xl font-bold text-orange-600">{results.tdee}</div>
                <div className="text-xs text-slate-400">cal/day</div>
              </div>
            </div>

            {/* Calorie Budget Bar */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Daily Calorie Budget</h3>
              <div className="relative bg-slate-100 rounded-full h-8 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-green-400 rounded-l-full flex items-center justify-end pr-2"
                  style={{ width: `${Math.min((results.lose.calories / results.gain.calories) * 100, 100)}%` }}
                >
                  <span className="text-xs font-medium text-green-900">{results.lose.calories}</span>
                </div>
                <div
                  className="absolute inset-y-0 left-0 bg-orange-400 rounded-l-full flex items-center justify-end pr-2"
                  style={{ width: `${Math.min((results.maintain.calories / results.gain.calories) * 100, 100)}%`, opacity: 0.6 }}
                >
                  <span className="text-xs font-medium text-orange-900">{results.maintain.calories}</span>
                </div>
                <div className="absolute inset-y-0 left-0 bg-red-400 rounded-full flex items-center justify-end pr-2" style={{ width: "100%" }}>
                  <span className="text-xs font-medium text-red-900">{results.gain.calories}</span>
                </div>
                {/* Overlay layering: green on top */}
                <div
                  className="absolute inset-y-0 left-0 bg-orange-400 rounded-l-full"
                  style={{ width: `${(results.maintain.calories / results.gain.calories) * 100}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 bg-green-400 rounded-l-full"
                  style={{ width: `${(results.lose.calories / results.gain.calories) * 100}%` }}
                />
                {/* Labels on top */}
                <div className="absolute inset-0 flex items-center text-xs font-semibold">
                  <div className="text-green-900 pl-2" style={{ width: `${(results.lose.calories / results.gain.calories) * 100}%` }}>
                    {results.lose.calories}
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span className="text-green-600">Lose weight</span>
                <span className="text-orange-600">Maintain</span>
                <span className="text-red-600">Gain weight</span>
              </div>
            </div>

            {/* Macro Breakdown Table */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Suggested Macro Breakdown</h3>
              <p className="text-xs text-slate-400 mb-2">30% protein / 40% carbs / 30% fat</p>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-sm">
                <div className="grid grid-cols-5 bg-slate-50 font-medium text-slate-600 text-xs">
                  <div className="p-2">Goal</div>
                  <div className="p-2 text-center">Calories</div>
                  <div className="p-2 text-center">Protein</div>
                  <div className="p-2 text-center">Carbs</div>
                  <div className="p-2 text-center">Fat</div>
                </div>
                {[results.lose, results.maintain, results.gain].map((row) => (
                  <div key={row.label} className="grid grid-cols-5 border-t border-slate-100">
                    <div className="p-2 text-xs font-medium text-slate-700">{row.label}</div>
                    <div className="p-2 text-center text-orange-600 font-semibold">{row.calories}</div>
                    <div className="p-2 text-center text-blue-600">{row.protein}g</div>
                    <div className="p-2 text-center text-green-600">{row.carbs}g</div>
                    <div className="p-2 text-center text-yellow-600">{row.fat}g</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formula note */}
            <p className="text-xs text-slate-400 text-center">
              Calculated using the Mifflin-St Jeor equation, widely regarded as the most accurate BMR formula.
            </p>
          </div>
        )}

        {/* High-CPC keywords footer */}
        <div className="pt-4 border-t border-slate-100 mt-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Looking to reach your fitness goals faster? Consider a{" "}
            <span className="font-medium text-slate-500">meal delivery service</span> tailored to your calorie needs,{" "}
            <span className="font-medium text-slate-500">nutrition coaching</span> for personalized guidance,{" "}
            or explore proven <span className="font-medium text-slate-500">weight loss programs</span> and high-quality{" "}
            <span className="font-medium text-slate-500">protein supplements</span> to support your daily macro targets.
          </p>
        </div>
      </div>
    </div>
  );
}
