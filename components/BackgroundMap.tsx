'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function BackgroundMap() {
  return (
    <div className="absolute inset-0 z-0 opacity-20">
      <MapContainer
        center={[41.0082, 28.9784]}
        zoom={100}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        touchZoom={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={true}
        />
      </MapContainer>
    </div>
  );
} 