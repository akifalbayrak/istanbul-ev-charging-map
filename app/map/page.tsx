'use client';

import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Create a client component that uses useSearchParams
function MapPageContent() {
  const searchParams = useSearchParams();
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  return (
    <main className="w-full h-screen">
      <MapView initialLocation={lat && lng ? [parseFloat(lat), parseFloat(lng)] : undefined} />
    </main>
  );
}

// Dynamically import the map component
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

// Main page component with Suspense boundary
export default function MapPage() {
  return (
    <Suspense 
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          <div className="text-lg">Yükleniyor...</div>
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  );
} 