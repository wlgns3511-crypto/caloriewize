import { ImageResponse } from 'next/og';
import { getFoodBySlug, getAllFoods } from '@/lib/db';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return getAllFoods().slice(0, 2000).map((f) => ({ slug: f.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = getFoodBySlug(slug);

  if (!f) {
    return new ImageResponse(
      <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: '#16a34a', color: 'white', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: 48, fontWeight: 800 }}>CALORIEWIZE</div>
      </div>,
      { ...size }
    );
  }

  const cal = f.calories !== null ? f.calories.toFixed(0) : '—';
  const protein = f.protein !== null ? f.protein.toFixed(1) + 'g' : '—';
  const fat = f.fat !== null ? f.fat.toFixed(1) + 'g' : '—';
  const carbs = f.carbs !== null ? f.carbs.toFixed(1) + 'g' : '—';
  const fiber = f.fiber !== null ? f.fiber.toFixed(1) + 'g' : null;

  // Macro bar percentages
  const macroTotal = (f.protein || 0) + (f.carbs || 0) + (f.fat || 0);
  const proteinPct = macroTotal > 0 ? Math.round((f.protein || 0) / macroTotal * 100) : 0;
  const carbsPct = macroTotal > 0 ? Math.round((f.carbs || 0) / macroTotal * 100) : 0;
  const fatPct = macroTotal > 0 ? Math.round((f.fat || 0) / macroTotal * 100) : 0;

  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', padding: '48px 56px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 18, color: '#16a34a', fontWeight: 800, letterSpacing: 3 }}>CALORIEWIZE</div>
          <div style={{ fontSize: 46, fontWeight: 800, color: '#0f172a', marginTop: 8, lineHeight: 1.1 }}>
            {f.name.length > 32 ? f.name.slice(0, 32) + '…' : f.name}
          </div>
          <div style={{ fontSize: 18, color: '#64748b', marginTop: 6 }}>
            Nutrition facts · per 100g serving
          </div>
        </div>

        {/* Calorie badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#dcfce7', borderRadius: 20, padding: '20px 32px', border: '2px solid #86efac' }}>
          <div style={{ fontSize: 64, fontWeight: 900, color: '#16a34a', lineHeight: 1 }}>{cal}</div>
          <div style={{ fontSize: 16, color: '#15803d', fontWeight: 600, marginTop: 4 }}>kcal</div>
        </div>
      </div>

      {/* Macro cards */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 28 }}>
        {[
          { label: 'Protein', value: protein, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
          { label: 'Carbs', value: carbs, color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
          { label: 'Fat', value: fat, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
          ...(fiber ? [{ label: 'Fiber', value: fiber, color: '#7c3aed', bg: '#faf5ff', border: '#ddd6fe' }] : []),
        ].map((m) => (
          <div key={m.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, backgroundColor: m.bg, borderRadius: 16, padding: '20px 16px', border: `2px solid ${m.border}` }}>
            <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{m.label}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Macro split bar */}
      {macroTotal > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
          <div style={{ display: 'flex', height: 24, borderRadius: 12, overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
            {proteinPct > 0 && <div style={{ width: `${proteinPct}%`, backgroundColor: '#3b82f6', height: '100%' }} />}
            {carbsPct > 0 && <div style={{ width: `${carbsPct}%`, backgroundColor: '#22c55e', height: '100%' }} />}
            {fatPct > 0 && <div style={{ width: `${fatPct}%`, backgroundColor: '#f59e0b', height: '100%' }} />}
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 14 }}>
            <span style={{ color: '#2563eb', fontWeight: 600 }}>Protein {proteinPct}%</span>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>Carbs {carbsPct}%</span>
            <span style={{ color: '#d97706', fontWeight: 600 }}>Fat {fatPct}%</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: 14, color: '#94a3b8' }}>caloriewize.com</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#16a34a' }} />
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Free nutrition database</div>
        </div>
      </div>

    </div>,
    { ...size }
  );
}
