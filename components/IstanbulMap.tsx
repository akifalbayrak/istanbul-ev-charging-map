'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import NearestStationCard from './NearestStationCard';

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

// Custom hook for zoom controls
function ZoomControls() {
  const map = useMap();
  const [currentZoom, setCurrentZoom] = useState(map.getZoom());

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

  const isZoomInDisabled = currentZoom >= 19;
  const isZoomOutDisabled = currentZoom <= 10;

  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col space-y-2">
      <button
        onClick={zoomIn}
        disabled={isZoomInDisabled}
        className={`
          w-10 h-10 rounded-lg shadow-lg flex items-center justify-center transition-colors
          ${isZoomInDisabled 
            ? 'bg-gray-100 cursor-not-allowed' 
            : 'bg-white/90 backdrop-blur-sm hover:bg-white'
          }
        `}
        aria-label="Zoom in"
      >
        <svg 
          className={`w-6 h-6 ${isZoomInDisabled ? 'text-gray-400' : 'text-gray-700'}`} 
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
          w-10 h-10 rounded-lg shadow-lg flex items-center justify-center transition-colors
          ${isZoomOutDisabled 
            ? 'bg-gray-100 cursor-not-allowed' 
            : 'bg-white/90 backdrop-blur-sm hover:bg-white'
          }
        `}
        aria-label="Zoom out"
      >
        <svg 
          className={`w-6 h-6 ${isZoomOutDisabled ? 'text-gray-400' : 'text-gray-700'}`} 
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

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('/api/stations');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const parsedStations = data.features.map((feature: GeoJSONFeature) => ({
          coordinates: feature.geometry.coordinates.reverse() as [number, number],
          name: feature.properties.AD,
          address: feature.properties.ADRES,
        }));
        
        setStations(parsedStations);
        setError(null);
      } catch (error) {
        setError('Şarj istasyonları yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, []);

  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      setIsFindingNearest(true);
      // Use Nominatim for geocoding
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          selectedLocation + ', Istanbul, Turkey'
        )}&limit=1`
      )
        .then(response => response.json())
        .then(data => {
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            const newPos = L.latLng(parseFloat(lat), parseFloat(lon));
            mapRef.current?.setView(newPos, 13);
            setUserLocation([parseFloat(lat), parseFloat(lon)]);
            
            // Find nearest station
            if (stations.length > 0) {
              let minDistance = Infinity;
              let nearest: Station | null = null;

              stations.forEach(station => {
                const dist = calculateDistance(
                  parseFloat(lat),
                  parseFloat(lon),
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
          }
        })
        .catch(() => {
          setError('Konum bulunamadı.');
        })
        .finally(() => {
          setIsFindingNearest(false);
        });
    }
  }, [selectedLocation, stations]);

  return (
    <div className="w-screen h-screen">
      <MapContainer
        ref={mapRef}
        center={[41.0082, 28.9784]} // Istanbul's center
        zoom={8}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={true}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapRestrictor />
        <ZoomControls />
        
        {/* Charging Stations */}
        {stations.map((station, index) => (
          <Marker 
            key={index} 
            position={station.coordinates}
            icon={chargingIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold mb-1 text-black">{station.name}</h3>
                <p className="text-sm text-gray-600">{station.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Nearest Station Card */}
      <NearestStationCard 
        station={nearestStation} 
        isLoading={isFindingNearest} 
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg z-[1000]">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-sm text-gray-700">Şarj istasyonları yükleniyor...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg shadow-lg z-[1000]">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
} 