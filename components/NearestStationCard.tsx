'use client';

import { useState, useEffect } from 'react';

interface Station {
  coordinates: [number, number];
  name: string;
  address: string;
}

interface NearestStationCardProps {
  userLocation: [number, number];
  stations: Station[];
}

export default function NearestStationCard({ userLocation, stations }: NearestStationCardProps) {
  const [nearestStation, setNearestStation] = useState<Station | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (!stations.length) return;

    // Find nearest station
    let minDistance = Infinity;
    let nearest: Station | null = null;

    stations.forEach(station => {
      const dist = calculateDistance(
        userLocation[0],
        userLocation[1],
        station.coordinates[0],
        station.coordinates[1]
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearest = station;
      }
    });

    setNearestStation(nearest);
    setDistance(minDistance);
  }, [userLocation, stations]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleNavigation = () => {
    if (!nearestStation) return;
    
    // Open Google Maps with directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${nearestStation.coordinates[0]},${nearestStation.coordinates[1]}&travelmode=driving`;
    window.open(url, '_blank');
  };

  if (!nearestStation) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-sm w-full">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1 text-black">{nearestStation.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{nearestStation.address}</p>
          {distance !== null && (
            <p className="text-sm text-gray-500">
              Mesafe: {distance.toFixed(1)} km
            </p>
          )}
        </div>
        <button
          onClick={handleNavigation}
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Yol Tarifi
        </button>
      </div>
    </div>
  );
} 