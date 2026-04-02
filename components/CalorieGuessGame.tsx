"use client";

import { useState, useCallback } from "react";

interface Food {
  name: string;
  slug: string;
  calories: number;
  category: string;
}

interface Props {
  foods: Food[];
}

export function CalorieGuessGame({ foods }: Props) {
  const [round, setRound] = useState(0);
  const [guess, setGuess] = useState(200);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [order, setOrder] = useState(() =>
    [...Array(foods.length).keys()].sort(() => Math.random() - 0.5).slice(0, 5)
  );

  const total = 5;
  const current = order[round];
  const food = foods[current];
  const done = round >= total || !food;

  const accuracy = food
    ? Math.max(0, 100 - Math.abs(guess - food.calories) / Math.max(food.calories, 1) * 100)
    : 0;

  const getColor = (acc: number) => {
    if (acc >= 90) return "text-emerald-600";
    if (acc >= 70) return "text-yellow-600";
    if (acc >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const handleReveal = useCallback(() => {
    setRevealed(true);
    if (accuracy >= 70) setScore(s => s + 1);
  }, [accuracy]);

  const handleNext = useCallback(() => {
    setRound(r => r + 1);
    setGuess(200);
    setRevealed(false);
  }, []);

  const handleRestart = useCallback(() => {
    setOrder([...Array(foods.length).keys()].sort(() => Math.random() - 0.5).slice(0, 5));
    setRound(0);
    setGuess(200);
    setRevealed(false);
    setScore(0);
  }, [foods.length]);

  if (foods.length < 5) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-slate-50 border border-emerald-200 rounded-xl p-6 my-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-emerald-900">Calorie Guessing Game</h3>
        <span className="text-sm text-emerald-600 font-medium">
          {done ? "Final Score" : `Round ${round + 1}/${total}`}
        </span>
      </div>

      {done ? (
        <div className="text-center py-6">
          <div className="text-5xl font-black text-emerald-700 mb-2">{score}/{total}</div>
          <p className="text-slate-600 mb-4">
            {score >= 4 ? "Impressive! You really know your nutrition." :
             score >= 2 ? "Not bad! Calories can be tricky to guess." :
             "Surprising results? Explore the nutrition facts below."}
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {order.map(idx => {
              const f = foods[idx];
              return f ? (
                <a key={f.slug} href={`/food/${f.slug}/`}
                  className="text-xs px-3 py-1.5 bg-white border border-emerald-200 rounded-full text-emerald-600 hover:bg-emerald-50">
                  {f.name}
                </a>
              ) : null;
            })}
          </div>
          <button onClick={handleRestart}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
            Play Again
          </button>
        </div>
      ) : (
        <>
          <p className="text-slate-700 mb-1 font-medium">
            How many calories per 100g?
          </p>
          <div className="mb-1">
            <p className="text-2xl font-bold text-emerald-800">{food.name}</p>
            {food.category && <p className="text-sm text-slate-500">{food.category}</p>}
          </div>

          <div className="mt-4 mb-4">
            <input
              type="range"
              min={0}
              max={900}
              step={10}
              value={guess}
              onChange={e => !revealed && setGuess(Number(e.target.value))}
              className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              disabled={revealed}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0 kcal</span>
              <span className="text-lg font-bold text-emerald-700">{guess} kcal</span>
              <span>900 kcal</span>
            </div>
          </div>

          {!revealed ? (
            <button onClick={handleReveal}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
              Reveal Answer
            </button>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 text-center border border-emerald-100">
                  <div className="text-xs text-slate-500 uppercase mb-1">Your Guess</div>
                  <div className="text-lg font-bold text-slate-700">{guess} kcal</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-emerald-100">
                  <div className="text-xs text-slate-500 uppercase mb-1">Actual</div>
                  <div className="text-lg font-bold text-emerald-700">{food.calories} kcal</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-emerald-100">
                  <div className="text-xs text-slate-500 uppercase mb-1">Accuracy</div>
                  <div className={`text-lg font-bold ${getColor(accuracy)}`}>
                    {accuracy.toFixed(0)}%
                  </div>
                </div>
              </div>
              <button onClick={handleNext}
                className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                {round + 1 < total ? "Next Question →" : "See Results"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
