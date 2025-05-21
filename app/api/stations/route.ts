import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://data.ibb.gov.tr/dataset/79b0e26e-e923-498b-a675-453382274178/resource/726e9d82-37f7-4142-8fa0-4f70a5530188/download/sarj_istasyonlari.geojson',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching stations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stations data' },
      { status: 500 }
    );
  }
} 