'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LocationInputProps {
  onError: (error: string) => void;
}

export default function LocationInput({ onError }: LocationInputProps) {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGeolocation = () => {
    setIsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          router.push(`/map?lat=${latitude}&lng=${longitude}`);
        },
        (error) => {
          setIsLoading(false);
          onError('Konum izni reddedildi veya alınamadı.');
        }
      );
    } else {
      setIsLoading(false);
      onError('Tarayıcınız konum özelliğini desteklemiyor.');
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      onError('Lütfen bir adres girin.');
      return;
    }

    setIsLoading(true);
    try {
      // Use Nominatim for geocoding (OpenStreetMap's geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address + ', Istanbul, Turkey'
        )}&limit=1`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        router.push(`/map?lat=${lat}&lng=${lon}`);
      } else {
        onError('Adres bulunamadı. Lütfen tekrar deneyin.');
        setIsLoading(false);
      }
    } catch {
      onError('Adres arama sırasında bir hata oluştu.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-black">
        İstanbul Şarj İstasyonları
      </h1>
      
      <div className="space-y-4">
        <button
          onClick={handleGeolocation}
          disabled={isLoading}
          className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Yükleniyor...
            </span>
          ) : (
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Konumumu Kullan
            </span>
          )}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">veya</span>
          </div>
        </div>

        <form onSubmit={handleAddressSubmit} className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Adres Girin
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Örn: Kadıköy, İstanbul"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Aranıyor...' : 'Adresi Ara'}
          </button>
        </form>
      </div>
    </div>
  );
} 