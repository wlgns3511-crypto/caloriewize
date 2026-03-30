export function AuthorBox() {
  return (
    <div className="mt-10 flex gap-4 p-5 bg-emerald-50 border-emerald-200 border rounded-xl">
      <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl">
        <span>🥗</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-slate-900 text-sm">Nutrition Research Team</span>
          <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-medium">Nutrition Data Specialists</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-2">Our nutrition analysts source and verify food composition data from the USDA FoodData Central database, cross-referencing with FDA labeling standards and WHO dietary guidelines to provide reliable nutritional information for thousands of foods.</p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">✓ USDA FoodData Central</span>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">✓ FDA Nutrition Standards</span>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">✓ WHO Dietary Guidelines</span>
        </div>
      </div>
    </div>
  );
}
