/* eslint-disable */
import React from 'react';
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(_req: Request) {
  const width = 1200;
  const height = 630;

  // Inter Black for headings
  const fontData = await fetch(
    'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa1Z0gIqf1Wq8.ttf'
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0B0F1A 0%, #111827 40%, #1F2937 100%)',
          color: '#fff',
          position: 'relative',
        }}
      >
        {/* Accent gradient blobs */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 420,
            height: 420,
            background:
              'radial-gradient(closest-side, rgba(168,85,247,0.35), rgba(168,85,247,0.0))',
            borderRadius: '50%',
            filter: 'blur(10px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -140,
            left: -120,
            width: 520,
            height: 520,
            background:
              'radial-gradient(closest-side, rgba(59,130,246,0.35), rgba(59,130,246,0.0))',
            borderRadius: '50%',
            filter: 'blur(12px)',
          }}
        />

        <div style={{ textAlign: 'center', padding: '0 80px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 14px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.06)',
              fontSize: 24,
              marginBottom: 24,
              fontFamily: 'Inter',
            }}
          >
            AI-Powered Measurements
          </div>
          <h1
            style={{
              fontSize: 86,
              lineHeight: 1.05,
              margin: 0,
              fontWeight: 800,
              letterSpacing: -1.5,
              background:
                'linear-gradient(90deg, #FFFFFF 0%, #93C5FD 45%, #C4B5FD 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontFamily: 'Inter',
            }}
          >
            Tailor AI
          </h1>
          <p
            style={{
              marginTop: 16,
              fontSize: 32,
              opacity: 0.95,
              fontFamily: 'Inter',
            }}
          >
            Precision Body Measurements & Luxury Store
          </p>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 36,
            right: 48,
            fontSize: 24,
            opacity: 0.7,
            fontFamily: 'Inter',
          }}
        >
          tailori.ca
        </div>
      </div>
    ),
    {
      width,
      height,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          style: 'normal',
          weight: 800,
        },
      ],
    }
  );
}
