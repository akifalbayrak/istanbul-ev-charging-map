'use client';

import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const MapView = dynamic(
  () => import('@/components/MapView').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-lg">Harita yükleniyor...</div>
      </div>
    ),
  }
);

export default function MapPage() {
  const searchParams = useSearchParams();
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  return (
    <main className="w-full h-screen">
      <MapView initialLocation={lat && lng ? [parseFloat(lat), parseFloat(lng)] : undefined} />
    </main>
  );
} 