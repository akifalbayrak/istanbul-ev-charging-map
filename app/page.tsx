'use client';

import dynamic from 'next/dynamic';

const MapView = dynamic(
  () => import('@/components/MapView').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-lg">Loading map...</div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="w-full h-screen">
      <MapView />
    </main>
  );
}
