'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import LocationInput from '../components/LocationInput';

// Dynamically import the map component with no SSR and proper loading state
const IstanbulMap = dynamic(() => import('@/components/IstanbulMap'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <div className="text-gray-600">Harita yükleniyor...</div>
      </div>
    </div>
  ),
});

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [showFullMap, setShowFullMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [mapKey, setMapKey] = useState(Date.now());

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLocationSelect = useCallback((location: string) => {
    setSelectedLocation(location);
    setShowFullMap(true);
    setError(null);
    // Generate new key when switching to full map
    setMapKey(Date.now());
  }, []);

  if (!isClient) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <div className="text-gray-600">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (showFullMap) {
    return (
      <main className="h-screen">
        <IstanbulMap key={mapKey} selectedLocation={selectedLocation} />
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-b from-blue-50 via-white to-white flex flex-col relative h-screen overflow-hidden">
      {/* Background Map with gradient overlay */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-white/80 to-white/90 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent z-10" />
        <div className="absolute inset-0 blur-[2px]">
          {isClient && <IstanbulMap key={`background-${mapKey}`} />}
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
              {error && (
                <div className="w-fit mx-auto my-2 sm:my-3 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-800 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-lg transform transition-all duration-300 ease-in-out hover:shadow-xl animate-fade-in-up">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="mt-0.5 sm:mt-1">
                      <svg className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 flex-shrink-0 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm sm:text-base tracking-tight">Hata</p>
                      <p className="text-xs sm:text-sm mt-1 sm:mt-1.5 leading-relaxed opacity-90">{error}</p>
                    </div>
                    <button 
                      onClick={() => setError(null)} 
                      className="text-red-400 hover:text-red-600 transition-colors duration-200 p-1 rounded-full hover:bg-red-100"
                      aria-label="Close error message"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              <LocationInput onError={setError} onLocationSelect={handleLocationSelect} />
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-xs sm:text-sm text-gray-500 inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-full">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  İpucu: Mahalle, semt veya ilçe adi girebilirsiniz
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
