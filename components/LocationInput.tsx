'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LocationInputProps {
  onError: (error: string) => void;
  onLocationSelect?: (location: string) => void;
}

export default function LocationInput({ onError, onLocationSelect }: LocationInputProps) {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGeolocation = () => {
    setIsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setIsLoading(false);
          if (onLocationSelect) {
            onLocationSelect(`${latitude},${longitude}`);
          } else {
            router.push(`/map?lat=${latitude}&lng=${longitude}&source=geolocation`);
          }
        },
        (error) => {
          setIsLoading(false);
          let errorMessage = 'Konum izni reddedildi veya alınamadı.';
          if (error.code === error.TIMEOUT) {
            errorMessage = 'Konum alınırken zaman aşımı oluştu.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = 'Konum bilgisi alınamadı.';
          }
          onError(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
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
        if (onLocationSelect) {
          onLocationSelect(address);
        } else {
          router.push(`/map?lat=${lat}&lng=${lon}`);
        }
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
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-3 sm:space-y-4">
        <button
          onClick={handleGeolocation}
          disabled={isLoading}
          className="w-full bg-blue-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xs sm:text-sm">Yükleniyor...</span>
            </span>
          ) : (
            <span className="flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs sm:text-sm">Konumumu Kullan</span>
            </span>
          )}
        </button>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddressSubmit(e);
              }
            }}
            placeholder="Mahalle, semt veya ilçe adı girin"
            className="text-black block w-full pl-10 pr-12 sm:pr-14 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleAddressSubmit}
            disabled={isLoading}
            className="absolute inset-y-0 right-0 px-3 sm:px-4 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Ara"
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            ) : (
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* Add the suggestions component here */}
      </div>
    </div>
  );
} 