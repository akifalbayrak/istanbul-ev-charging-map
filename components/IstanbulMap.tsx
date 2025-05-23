'use client';

import { useEffect, useRef, useState, useCallback, CSSProperties } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import NearestStationCard from './NearestStationCard';
import { getCachedStations, setCachedStations } from '../lib/cache';

// Istanbul's approximate boundaries - slightly expanded for a more zoomed out view
const ISTANBUL_BOUNDS = L.latLngBounds(
  [40.8025, 28.2567], // Southwest coordinates - expanded outward
  [41.4205, 29.6567]  // Northeast coordinates - expanded outward
);

interface Station {
  coordinates: [number, number];
  name: string;
  address: string;
  distance?: number;
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

interface GeoJSONData {
  features: GeoJSONFeature[];
}

// Custom hook to restrict map movement
function MapRestrictor() {
  const map = useMap();

  useEffect(() => {
    // Set max bounds to Istanbul
    map.setMaxBounds(ISTANBUL_BOUNDS);
    
    // Set a lower minimum zoom level to allow more zooming out
    map.setMinZoom(10);
    
    // Set initial view to show all of Istanbul
    map.fitBounds(ISTANBUL_BOUNDS);
    
    // Disable dragging outside bounds
    map.setMaxBounds(ISTANBUL_BOUNDS);
  }, [map]);

  return null;
}

// Custom charging station icon
const chargingIcon = L.divIcon({
  className: 'charging-station-icon',
  html: `
    <div style="
      background-color: #2563eb;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 4px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});
// Custom user location icon
const userLocationIcon = L.divIcon({
  className: 'user-location-icon',
  html: `
    <div style="
      background-color: #22c55e;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 8px rgba(0,0,0,0.3);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Custom hook for zoom controls
function ZoomControls({ onLocationUpdate, userLocation }: { 
  onLocationUpdate: (lat: number, lng: number) => void;
  userLocation: [number, number] | null;
}) {
  const map = useMap();
  const [currentZoom, setCurrentZoom] = useState(map.getZoom());
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const updateZoom = () => {
      setCurrentZoom(map.getZoom());
    };

    map.on('zoomend', updateZoom);
    return () => {
      map.off('zoomend', updateZoom);
    };
  }, [map]);

  const zoomIn = () => {
    if (currentZoom < 19) {
      map.zoomIn();
    }
  };

  const zoomOut = () => {
    if (currentZoom > 10) {
      map.zoomOut();
    }
  };

  const focusOnLocation = () => {
    // If we already have user location, just focus on it
    if (userLocation) {
      const [lat, lng] = userLocation;
      const newPos = L.latLng(lat, lng);
      map.setView(newPos, 15);
      return;
    }

    // Otherwise get new location
    if (!("geolocation" in navigator)) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPos = L.latLng(latitude, longitude);
        map.setView(newPos, 15);
        onLocationUpdate(latitude, longitude);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const isZoomInDisabled = currentZoom >= 19;
  const isZoomOutDisabled = currentZoom <= 10;

  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col space-y-2">
       <button
        onClick={focusOnLocation}
        disabled={isLocating}
        className={`
          w-8 h-8 sm:w-10 sm:h-10 rounded-lg shadow-lg flex items-center justify-center transition-colors
          ${isLocating 
            ? 'bg-gray-100 cursor-not-allowed' 
            : 'bg-white/90 backdrop-blur-sm hover:bg-white'
          }
        `}
        aria-label="Konumuma odaklan"
      >
        {isLocating ? (
          <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-green-500 border-t-transparent rounded-full"></div>
        ) : (
          <svg 
            className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>

      <button
        onClick={zoomIn}
        disabled={isZoomInDisabled}
        className={`
          w-8 h-8 sm:w-10 sm:h-10 rounded-lg shadow-lg flex items-center justify-center transition-colors
          ${isZoomInDisabled 
            ? 'bg-gray-100 cursor-not-allowed' 
            : 'bg-white/90 backdrop-blur-sm hover:bg-white'
          }
        `}
        aria-label="Zoom in"
      >
        <svg 
          className={`w-5 h-5 sm:w-6 sm:h-6 ${isZoomInDisabled ? 'text-gray-400' : 'text-gray-700'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      
      <button
        onClick={zoomOut}
        disabled={isZoomOutDisabled}
        className={`
          w-8 h-8 sm:w-10 sm:h-10 rounded-lg shadow-lg flex items-center justify-center transition-colors
          ${isZoomOutDisabled 
            ? 'bg-gray-100 cursor-not-allowed' 
            : 'bg-white/90 backdrop-blur-sm hover:bg-white'
          }
        `}
        aria-label="Zoom out"
      >
        <svg 
          className={`w-5 h-5 sm:w-6 sm:h-6 ${isZoomOutDisabled ? 'text-gray-400' : 'text-gray-700'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
        </svg>
      </button>
    </div>
  );
}

interface IstanbulMapProps {
  selectedLocation?: string | null;
}

// Add this utility function at the top level
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function IstanbulMap({ selectedLocation }: IstanbulMapProps) {
  const mapRef = useRef<L.Map>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nearestStation, setNearestStation] = useState<Station | null>(null);
  const [isFindingNearest, setIsFindingNearest] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapStyle] = useState<CSSProperties>({
    transform: 'translateZ(0)',
    WebkitTransform: 'translateZ(0)',
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
    perspective: 1000,
    WebkitPerspective: 1000,
  });

  const handleLocationUpdate = (lat: number, lng: number) => {
    setUserLocation([lat, lng]);
    findNearestStation(lat, lng);
  };

  // Wrap findNearestStation in useCallback
  const findNearestStation = useCallback((lat: number, lng: number) => {
    if (stations.length === 0) return;
    
    setIsFindingNearest(true);
    let minDistance = Infinity;
    let nearest: Station | null = null;

    stations.forEach(station => {
      const dist = calculateDistance(
        lat,
        lng,
        station.coordinates[0],
        station.coordinates[1]
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearest = { ...station, distance: dist };
      }
    });

    setNearestStation(nearest);
    setIsFindingNearest(false);
  }, [stations]); // Add stations as a dependency since it's used inside the callback

  // Add this effect to handle URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const lat = params.get('lat');
      const lng = params.get('lng');
      const source = params.get('source');

      if (lat && lng) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        setUserLocation([latitude, longitude]);
        
        if (mapRef.current) {
          const newPos = L.latLng(latitude, longitude);
          mapRef.current.setView(newPos, 13);
          
          // If source is geolocation, immediately find nearest station
          if (source === 'geolocation' && stations.length > 0) {
            findNearestStation(latitude, longitude);
          }
        }
      }
    }
  }, [stations, findNearestStation]); // Add findNearestStation to dependencies

  // Update the selectedLocation effect
  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      setIsFindingNearest(true);
      
      // Check if selectedLocation is already coordinates
      const coords = selectedLocation.split(',');
      if (coords.length === 2 && !isNaN(parseFloat(coords[0])) && !isNaN(parseFloat(coords[1]))) {
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        const newPos = L.latLng(lat, lng);
        mapRef.current.setView(newPos, 13);
        setUserLocation([lat, lng]);
        findNearestStation(lat, lng);
        return;
      }

      // Otherwise, use Nominatim for geocoding
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          selectedLocation + ', Istanbul, Turkey'
        )}&limit=1`
      )
        .then(response => response.json())
        .then(data => {
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);
            const newPos = L.latLng(latitude, longitude);
            mapRef.current?.setView(newPos, 13);
            setUserLocation([latitude, longitude]);
            findNearestStation(latitude, longitude);
          } else {
            setError('Konum bulunamadı.');
            setIsFindingNearest(false);
          }
        })
        .catch(() => {
          setError('Konum arama sırasında bir hata oluştu.');
          setIsFindingNearest(false);
        });
    }
  }, [selectedLocation, findNearestStation]); // Remove stations from dependencies since it's included in findNearestStation

  useEffect(() => {
    const fetchStations = async () => {
      try {
        // Try to get data from cache first
        const cachedData = await getCachedStations<GeoJSONData>();
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
      } catch {
        setError('Şarj istasyonları yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Add Safari-specific map options
  const mapOptions = {
    easeLinearity: 0.35,
    zoomAnimation: true,
    zoomAnimationThreshold: 4,
    markerZoomAnimation: true,
    transform3DLimit: 8388608, // 2^23
    preferCanvas: true, // Use canvas renderer for better performance
  };

  return (
    <div 
      className="w-full h-full"
      style={mapStyle}
    >
      {!isMapReady && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[1000] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <div className="text-gray-600">Harita yükleniyor...</div>
          </div>
        </div>
      )}
      
      <MapContainer
        ref={mapRef}
        center={[41.0082, 28.9784]}
        zoom={8}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={true}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        whenReady={() => {
          setIsMapReady(true);
          setIsLoading(false);
        }}
        {...mapOptions}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapRestrictor />
        <ZoomControls onLocationUpdate={handleLocationUpdate} userLocation={userLocation} />
        
        {/* User Location Marker */}
        {userLocation && (
          <Marker 
            position={userLocation}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="p-2 min-w-[180px] sm:min-w-[200px]">
                <h3 className="font-bold mb-1 text-sm sm:text-base">Konumunuz</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Charging Stations */}
        {stations.map((station, index) => (
          <Marker 
            key={index} 
            position={station.coordinates}
            icon={chargingIcon}
          >
            <Popup>
              <div className="p-2 min-w-[180px] sm:min-w-[200px]">
                <h3 className="font-bold mb-1 text-sm sm:text-base text-black">{station.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">{station.address}</p>
                <button
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.coordinates[0]},${station.coordinates[1]}&travelmode=driving`;
                    window.open(url, '_blank');
                  }}
                  className="w-full bg-blue-500 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>Yol Tarifi Al</span>
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Loading State for Stations */}
      {isLoading && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg z-[1000]">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-xs sm:text-sm text-gray-700">Şarj istasyonları yükleniyor...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg z-[1000] max-w-[calc(100vw-2rem)]">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs sm:text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Nearest Station Card */}
      <NearestStationCard 
        station={nearestStation} 
        isLoading={isFindingNearest} 
      />
    </div>
  );
} 