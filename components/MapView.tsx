'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import '../lib/fixLeafletIcons';
import NearestStationCard from './NearestStationCard';
import { getCachedStations, setCachedStations } from '../lib/cache';

interface LocationMarkerProps {
  onError: (error: string) => void;
  onLocationFound: (lat: number, lng: number) => void;
}

// Component to handle map centering
function LocationMarker({ onError, onLocationFound }: LocationMarkerProps) {
  const map = useMap();
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos = L.latLng(latitude, longitude);
          setPosition(newPos);
          map.setView(newPos, 13);
          onLocationFound(latitude, longitude);
        },
        () => {
          onError('Konum izni reddedildi veya alınamadı.');
        }
      );
    } else {
      onError('Tarayıcınız konum özelliğini desteklemiyor.');
    }
  }, [map, onError, onLocationFound]);

  return position ? (
    <Marker position={position}>
      <Popup>
        <div className="p-2">
          <h3 className="font-bold mb-1">Konumunuz</h3>
          <p className="text-sm text-gray-600">
            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

interface Station {
  coordinates: [number, number];
  name: string;
  address: string;
  distance?: number;
}

interface MapViewProps {
  initialLocation?: [number, number];
}

interface GeoJSONFeature {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    AD: string;
    ADRES: string;
  };
}

// Add this utility function at the top level
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function MapView({ initialLocation }: MapViewProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<PermissionState>('prompt');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearestStation, setNearestStation] = useState<Station | null>(null);

  useEffect(() => {
    if (initialLocation) {
      setUserLocation(initialLocation);
    }
  }, [initialLocation]);

  useEffect(() => {
    // Check location permission status
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state);
        result.onchange = () => setLocationPermission(result.state);
      });
    }
  }, []);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        // Try to get data from cache first
        const cachedData = await getCachedStations<any>();
        if (cachedData) {
          const parsedStations = cachedData.features.map((feature: GeoJSONFeature) => ({
            coordinates: feature.geometry.coordinates.reverse() as [number, number],
            name: feature.properties.AD,
            address: feature.properties.ADRES,
          }));
          setStations(parsedStations);
          setError(null);
          setIsLoading(false);
          return;
        }

        // If no cache, fetch from API
        const response = await fetch('/api/stations');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Cache the fetched data
        setCachedStations(data);
        
        const parsedStations = data.features.map((feature: GeoJSONFeature) => ({
          coordinates: feature.geometry.coordinates.reverse() as [number, number],
          name: feature.properties.AD,
          address: feature.properties.ADRES,
        }));
        
        setStations(parsedStations);
        setError(null);
      } catch (error) {
        setError('Şarj istasyonları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Add this effect to calculate nearest station
  useEffect(() => {
    if (userLocation && stations.length > 0) {
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
          nearest = { ...station, distance: dist };
        }
      });

      setNearestStation(nearest);
    }
  }, [userLocation, stations]);

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermission('granted');
          setError(null);
        },
        () => {
          setLocationPermission('denied');
          setError('Konum izni reddedildi.');
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg">Şarj istasyonları yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Error Display */}
      {error && (
        <div className="absolute top-4 right-4 z-[1000] bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
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

      {/* Location Permission Request */}
      {locationPermission === 'prompt' && !error && !initialLocation && (
        <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg">
          <p className="mb-2 text-black">Konumunuza en yakın şarj istasyonlarını görmek için konum izni verin.</p>
          <button
            onClick={requestLocation}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Konum İzni Ver
          </button>
        </div>
      )}

      <MapContainer
        center={initialLocation || [41.0082, 28.9784]}
        zoom={initialLocation ? 13 : 10}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!initialLocation && (
          <LocationMarker 
            onError={setError} 
            onLocationFound={(lat, lng) => setUserLocation([lat, lng])} 
          />
        )}
        {stations.map((station, index) => (
          <Marker key={index} position={station.coordinates}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold mb-1">{station.name}</h3>
                <p className="text-sm text-gray-600">{station.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Update NearestStationCard usage */}
      {userLocation && (
        <NearestStationCard
          station={nearestStation}
          isLoading={isLoading}
        />
      )}
    </div>
  );
} 