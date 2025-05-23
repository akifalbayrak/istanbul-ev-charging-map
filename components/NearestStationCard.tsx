'use client';

import { useState, useEffect } from 'react';
import { CSSProperties } from 'react';

interface Station {
  coordinates: [number, number];
  name: string;
  address: string;
  distance?: number;
}

interface NearestStationCardProps {
  station: Station | null;
  isLoading?: boolean;
}

export default function NearestStationCard({ station, isLoading }: NearestStationCardProps) {
  const [isVisible, setIsVisible] = useState(true);
  const cardStyle: CSSProperties = {
    transform: 'translateZ(0)',
    WebkitTransform: 'translateZ(0)',
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
    willChange: 'transform, opacity',
  };

  // Reset visibility when station changes
  useEffect(() => {
    setIsVisible(true);
  }, [station]);

  const handleNavigation = () => {
    if (!station) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.coordinates[0]},${station.coordinates[1]}&travelmode=driving`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div 
        className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-lg shadow-lg z-[1000] max-w-[calc(100vw-2rem)] sm:max-w-sm w-full"
        style={cardStyle}
      >
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="text-xs sm:text-sm text-gray-700">En yakın istasyon aranıyor...</span>
        </div>
      </div>
    );
  }

  if (!station || !isVisible) {
    return null;
  }

  return (
    <div 
      className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-lg shadow-lg z-[1000] max-w-[calc(100vw-2rem)] sm:max-w-sm w-full transition-all duration-300 ease-out transform hover:scale-[1.02]"
      style={cardStyle}
    >
      <div className="flex items-start">
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{station.name}</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors p-0.5 sm:p-1 -mt-0.5 sm:-mt-1 -mr-0.5 sm:-mr-1"
              aria-label="Kapat"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 line-clamp-2">{station.address}</p>
          {station.distance && (
            <p className="text-xs sm:text-sm text-blue-600 font-medium mb-2 sm:mb-3">
              {station.distance < 1 
                ? `${Math.round(station.distance * 1000)} metre uzaklıkta`
                : `${station.distance.toFixed(1)} km uzaklıkta`
              }
            </p>
          )}
          <button
            onClick={handleNavigation}
            className="w-full bg-blue-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>Yol Tarifi Al</span>
          </button>
        </div>
      </div>
    </div>
  );
} 