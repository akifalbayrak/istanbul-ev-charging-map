'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import LocationInput from '../components/LocationInput';

// Dynamically import the map component with no SSR
const IstanbulMap = dynamic(() => import('@/components/IstanbulMap'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
      <div className="text-gray-600">Loading map...</div>
    </div>
  ),
});

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [showFullMap, setShowFullMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setShowFullMap(true);
    setError(null);
  };

  if (showFullMap) {
    return (
      <main className="h-screen relative">
        <IstanbulMap selectedLocation={selectedLocation} />
        <div className="absolute bottom-4 left-4 z-[1000]">
          <button
            onClick={() => setShowFullMap(false)}
            className="flex items-center justify-center w-10 h-10 bg-white/90 hover:bg-white text-gray-800 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
            title="Ana Sayfaya Dön"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-b from-blue-50 via-white to-white flex flex-col relative h-screen overflow-hidden">
      {/* Background Map with gradient overlay */}
      <div className="fixed inset-0 z-0 ">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-white/80 to-white/90 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent z-10" />
        <div className="absolute inset-0 blur-[2px]">
          <IstanbulMap />
        </div>
      </div>

      {/* Animated background shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-green-200/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-20 overflow-y-auto">
        {/* Hero Section */}
        <section className="py-2 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            {/* Animated badge */}
            <div className="inline-flex items-center gap-2 my-2 sm:my-3 px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs sm:text-sm font-semibold text-white">İstanbul&apos;un En Kapsamlı Şarj İstasyonu Haritası</span>
            </div>

            {/* Main heading with gradient and animation */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold py-1 sm:py-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-300 animate-gradient-x tracking-tight">
              Şarj İstasyonu Haritası
            </h1>

            {/* Description with enhanced typography */}
            <p className="mt-2 sm:mt-6 max-w-2xl sm:max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed px-4 sm:px-0 font-medium">
              İstanbul&apos;daki tüm elektrikli araç şarj istasyonlarını keşfedin. En yakın şarj noktasını bulun ve yolculuğunuza güvenle devam edin.
            </p>

            {/* Feature highlights with hover effects */}
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-4 px-4 sm:px-0">
              <div className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-green-800">Gerçek Zamanlı Durum</span>
              </div>
              <div className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-purple-800">500+ İstasyon</span>
              </div>
              <div className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-orange-800">7/24 Güncel</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section with enhanced design */}
        <section className="py-2 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-gray-100">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-300 mb-2 sm:mb-3">
                  Şarj İstasyonu Ara
                </h2>
                <p className="text-sm sm:text-base text-gray-600">Konumunuzu girin ve size en yakın şarj istasyonlarını bulun</p>
              </div>
              <LocationInput onError={setError} onLocationSelect={handleLocationSelect} />
              {error && (
                <div className="mx-auto w-fit my-2 bg-red-50 text-red-700 px-4 py-2 rounded">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-xs sm:text-sm text-gray-500 inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-full">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  İpucu: Mahalle, semt veya ilçe adı girebilirsiniz
                </p>
              <div className="mt-4 sm:mt-6 text-center">
                <a 
                  href="https://github.com/akifalbayrak" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors duration-200"
                  aria-label="GitHub Profile"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
