'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import '../lib/fixLeafletIcons';

interface Station {
  coordinates: [number, number];
  name: string;
  address: string;
}

export default function MapView() {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('/api/stations');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const parsedStations = data.features.map((feature: any) => ({
          coordinates: feature.geometry.coordinates.reverse() as [number, number], // Convert [lng, lat] to [lat, lng]
          name: feature.properties.AD,
          address: feature.properties.ADRES,
        }));
        
        setStations(parsedStations);
        setError(null);
      } catch (error) {
        console.error('Error fetching stations:', error);
        setError('Şarj istasyonları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg">Şarj istasyonları yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[41.0082, 28.9784]}
      zoom={10}
      className="w-full h-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
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
  );
} 