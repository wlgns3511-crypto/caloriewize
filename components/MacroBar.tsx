interface MacroBarProps {
  carbs: number | null;
  protein: number | null;
  fat: number | null;
}

export function MacroBar({ carbs, protein, fat }: MacroBarProps) {
  const carbCal = (carbs || 0) * 4;
  const proteinCal = (protein || 0) * 4;
  const fatCal = (fat || 0) * 9;
  const total = carbCal + proteinCal + fatCal;

  if (total === 0) return null;

  const carbPct = (carbCal / total) * 100;
  const proteinPct = (proteinCal / total) * 100;
  const fatPct = (fatCal / total) * 100;

  const segments = [
    { label: "Carbs", pct: carbPct, cal: carbCal, color: "#f59e0b" },
    { label: "Protein", pct: proteinPct, cal: proteinCal, color: "#3b82f6" },
    { label: "Fat", pct: fatPct, cal: fatCal, color: "#ef4444" },
  ];

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold mb-2">Calorie Sources</h2>
      <p className="text-xs text-slate-400 mb-3">
        % of calories from each macronutrient (carbs 4 kcal/g, protein 4 kcal/g, fat 9 kcal/g)
      </p>
      <div className="flex h-7 rounded-full overflow-hidden">
        {segments.map((s) =>
          s.pct > 0 ? (
            <div
              key={s.label}
              className="h-full flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${s.pct}%`, backgroundColor: s.color, minWidth: "1.5rem" }}
              title={`${s.label}: ${s.pct.toFixed(0)}% (${s.cal.toFixed(0)} kcal)`}
            >
              {s.pct >= 12 ? `${s.pct.toFixed(0)}%` : ""}
            </div>
          ) : null,
        )}
      </div>
      <div className="flex justify-between text-xs mt-2">
        {segments.map((s) => (
          <span key={s.label} style={{ color: s.color }} className="font-medium">
            {s.label} {s.pct.toFixed(0)}% ({s.cal.toFixed(0)} kcal)
          </span>
        ))}
      </div>
    </div>
  );
}
