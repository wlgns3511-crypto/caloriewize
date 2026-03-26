import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CalorieWize - Food Nutrition and Calorie Data';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#ea580c', color: 'white', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: 72, fontWeight: 800, marginBottom: 16 }}>CalorieWize</div>
        <div style={{ fontSize: 32, opacity: 0.9 }}>Food Nutrition and Calorie Data</div>
      </div>
    ),
    { ...size }
  );
}
