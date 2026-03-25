import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CalorieWize - Calories & Nutrition Facts';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 50%, #c2410c 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 'bold', marginBottom: 20 }}>
          CalorieWize
        </div>
        <div style={{ fontSize: 32, opacity: 0.9 }}>
          Calories & Nutrition Facts
        </div>
      </div>
    ),
    { ...size }
  );
}
