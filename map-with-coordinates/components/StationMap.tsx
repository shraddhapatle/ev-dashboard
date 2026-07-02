'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import StationDetails from './StationDetails';
import type { Station } from '@/types/station';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface StationMapProps {
  stations: Station[];
  center?: [number, number];
  zoom?: number;
}

export default function StationMap({ 
  stations, 
  center = [28.6139, 77.2090],
  zoom = 12 
}: StationMapProps) {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [mounted, setMounted] = useState(false);
  const [defaultIcon, setDefaultIcon] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Import Leaflet icon after component mounts
    import('leaflet').then((L) => {
      setDefaultIcon(
        L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })
      );
    });
  }, []);

  if (!mounted || !defaultIcon) {
    return <div className="w-full h-full bg-gray-100 flex items-center justify-center" style={{ minHeight: '600px' }}>Loading map...</div>;
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ minHeight: '600px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stations.map((station, index) => (
          <Marker
            key={`${station.uid}-${index}`}
            position={[station.latitude, station.longitude]}
            icon={defaultIcon}
            eventHandlers={{
              click: () => setSelectedStation(station),
            }}
          >
            <Popup>
              <div className="text-sm font-medium">{station.Name}</div>
              <div className="text-xs text-gray-600">{station.address}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {selectedStation && (
        <StationDetails 
          station={selectedStation} 
          onClose={() => setSelectedStation(null)}
        />
      )}
    </div>
  );
}
