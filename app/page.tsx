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
      <main className="h-screen">
        <IstanbulMap selectedLocation={selectedLocation} />
      </main>
    );
  }

  return (
    <main className="bg-gray-50 flex flex-col relative">
      {/* Background Map */}
      <div className="fixed inset-0 z-0 opacity-30">
        <IstanbulMap />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        {/* Hero Section */}
        <section className="py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-block mb-3 px-4 py-1 bg-blue-100 rounded-full">
              <span className="text-sm font-medium text-blue-800">İstanbul&apos;un En Kapsamlı Şarj İstasyonu Haritası</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight lg:text-5xl">
              Elektrikli Araç Şarj İstasyonları
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed">
              İstanbul&apos;daki tüm elektrikli araç şarj istasyonlarını keşfedin. En yakın şarj noktasını bulun ve yolculuğunuza güvenle devam edin.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                <div className="text-blue-600 mb-4">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gerçek Zamanlı Konum</h3>
                <p className="text-sm text-gray-600">Size en yakın şarj istasyonlarını anında bulun ve rotanızı planlayın.</p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                <div className="text-blue-600 mb-4">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hızlı Şarj</h3>
                <p className="text-sm text-gray-600">Hızlı şarj noktalarını kolayca filtreleyin ve şarj sürenizi optimize edin.</p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                <div className="text-blue-600 mb-4">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Güvenilir Bilgi</h3>
                <p className="text-sm text-gray-600">Güncel ve doğrulanmış şarj istasyonu bilgileriyle güvenle seyahat edin.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Şarj İstasyonu Ara
                </h2>
                <p className="text-sm text-gray-600">Konumunuzu girin ve size en yakın şarj istasyonlarını bulun</p>
              </div>
              {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="py-1">
                      <svg className="h-6 w-6 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold">Hata</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              <LocationInput onError={setError} onLocationSelect={handleLocationSelect} />
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-sm border-t relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} İstanbul Şarj İstasyonları Haritası
          </p>
        </div>
      </footer>
    </main>
  );
}
