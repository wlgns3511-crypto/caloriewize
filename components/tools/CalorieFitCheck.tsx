"use client";

import { useState } from "react";

interface CalorieFitCheckProps {
  name: string;
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  serving_size: string | null;
}

const PROTEIN_CAL_PER_G = 4;
const CARB_CAL_PER_G = 4;
const FAT_CAL_PER_G = 9;

function getVerdict(pct: number): { label: string; color: string; bg: string } {
  if (pct <= 8) return { label: "Snack", color: "text-green-700", bg: "bg-green-100" };
  if (pct <= 20) return { label: "Light Meal", color: "text-blue-700", bg: "bg-blue-100" };
  if (pct <= 35) return { label: "Full Meal", color: "text-orange-700", bg: "bg-orange-100" };
  return { label: "Heavy", color: "text-red-700", bg: "bg-red-100" };
}

export function CalorieFitCheck({ name, calories, protein, fat, carbs, serving_size }: CalorieFitCheckProps) {
  const [goal, setGoal] = useState(2000);

  const cal = calories ?? 0;
  const prot = protein ?? 0;
  const f = fat ?? 0;
  const carb = carbs ?? 0;

  const pctOfDaily = goal > 0 ? (cal / goal) * 100 : 0;
  const servingsToGoal = cal > 0 ? goal / cal : 0;
  const verdict = getVerdict(pctOfDaily);

  // Macro calories
  const protCal = prot * PROTEIN_CAL_PER_G;
  const carbCal = carb * CARB_CAL_PER_G;
  const fatCal = f * FAT_CAL_PER_G;
  const totalMacroCal = protCal + carbCal + fatCal;

  const protPct = totalMacroCal > 0 ? (protCal / totalMacroCal) * 100 : 0;
  const carbPct = totalMacroCal > 0 ? (carbCal / totalMacroCal) * 100 : 0;
  const fatPct = totalMacroCal > 0 ? (fatCal / totalMacroCal) * 100 : 0;

  // Recommended daily macro ranges (% of calories)
  const protDailyPct = goal > 0 ? (protCal / goal) * 100 : 0;
  const carbDailyPct = goal > 0 ? (carbCal / goal) * 100 : 0;
  const fatDailyPct = goal > 0 ? (fatCal / goal) * 100 : 0;

  return (
    <section className="border border-orange-200 rounded-xl p-5 bg-orange-50/50 mb-8">
      <h2 className="text-lg font-bold text-orange-900 mb-1">Daily Calorie Fit Check</h2>
      <p className="text-sm text-slate-500 mb-4">
        See how {name} ({serving_size || "100g"}) fits your daily calorie goal.
      </p>

      {/* Slider */}
      <div className="mb-5">
        <label className="flex items-center justify-between text-sm mb-1">
          <span className="font-medium text-slate-700">Daily calorie goal</span>
          <span className="font-bold text-orange-700 text-lg">{goal.toLocaleString()} kcal</span>
        </label>
        <input
          type="range"
          min={1200}
          max={3000}
          step={50}
          value={goal}
          onChange={(e) => setGoal(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-0.5">
          <span>1,200</span>
          <span>3,000</span>
        </div>
      </div>

      {/* Progress bar - % of daily intake */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-slate-600">% of daily intake</span>
          <span className="font-bold text-orange-700">{pctOfDaily.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300 flex items-center justify-end pr-2"
            style={{ width: `${Math.min(pctOfDaily, 100)}%` }}
          >
            {pctOfDaily >= 12 && (
              <span className="text-[10px] font-bold text-white">{pctOfDaily.toFixed(0)}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Macro pie-style CSS chart */}
      {totalMacroCal > 0 && (
        <div className="mb-5">
          <p className="text-sm font-medium text-slate-700 mb-2">Macro breakdown (per 100g)</p>
          <div className="flex items-center gap-4">
            {/* CSS conic-gradient pie */}
            <div
              className="w-24 h-24 rounded-full flex-shrink-0"
              style={{
                background: `conic-gradient(
                  #3b82f6 0% ${protPct}%,
                  #22c55e ${protPct}% ${protPct + carbPct}%,
                  #eab308 ${protPct + carbPct}% 100%
                )`,
              }}
            >
              <div className="w-full h-full rounded-full flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-700">{cal.toFixed(0)}<br /><span className="text-[9px] font-normal">kcal</span></span>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-blue-500" />
                <span className="text-slate-600">Protein</span>
                <span className="font-medium ml-auto">{prot.toFixed(1)}g</span>
                <span className="text-slate-400 text-xs w-10 text-right">{protPct.toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <span className="text-slate-600">Carbs</span>
                <span className="font-medium ml-auto">{carb.toFixed(1)}g</span>
                <span className="text-slate-400 text-xs w-10 text-right">{carbPct.toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-yellow-500" />
                <span className="text-slate-600">Fat</span>
                <span className="font-medium ml-auto">{f.toFixed(1)}g</span>
                <span className="text-slate-400 text-xs w-10 text-right">{fatPct.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Macro as % of daily goal bars */}
      <div className="mb-5 space-y-2">
        <p className="text-sm font-medium text-slate-700 mb-1">Macro as % of daily goal</p>
        {[
          { label: "Protein", pct: protDailyPct, color: "bg-blue-500" },
          { label: "Carbs", pct: carbDailyPct, color: "bg-green-500" },
          { label: "Fat", pct: fatDailyPct, color: "bg-yellow-500" },
        ].map((m) => (
          <div key={m.label} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-14">{m.label}</span>
            <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full ${m.color} transition-all duration-300`}
                style={{ width: `${Math.min(m.pct, 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium w-10 text-right">{m.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>

      {/* Results row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white rounded-lg p-3 border border-slate-100">
          <div className="text-xs text-slate-500 mb-0.5">Servings to goal</div>
          <div className="text-xl font-bold text-slate-800">{servingsToGoal.toFixed(1)}</div>
          <div className="text-[10px] text-slate-400">{serving_size || "100g"} each</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-100">
          <div className="text-xs text-slate-500 mb-0.5">Calories</div>
          <div className="text-xl font-bold text-orange-600">{cal.toFixed(0)}</div>
          <div className="text-[10px] text-slate-400">per {serving_size || "100g"}</div>
        </div>
        <div className={`rounded-lg p-3 border ${verdict.bg}`}>
          <div className="text-xs text-slate-500 mb-0.5">Verdict</div>
          <div className={`text-xl font-bold ${verdict.color}`}>{verdict.label}</div>
          <div className="text-[10px] text-slate-400">{pctOfDaily.toFixed(0)}% of daily</div>
        </div>
      </div>
    </section>
  );
}
