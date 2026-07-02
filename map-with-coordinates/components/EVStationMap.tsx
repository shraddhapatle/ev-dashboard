'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { EVStation } from '@/lib/types'
import MarkerPopupContent from './MarkerPopupContent'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface EVStationMapProps {
  stations: EVStation[]
  center?: [number, number]
  zoom?: number
  height?: string
}

export default function EVStationMap({
  stations,
  center = [28.6139, 77.2090], // Default to New Delhi center
  zoom = 12,
  height = '500px',
}: EVStationMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%' }}
      className="rounded-lg shadow-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {stations.map((station) => (
        <Marker
          key={station.uid}
          position={[station.latitude, station.longitude]}
        >
          <Popup maxWidth={400} className="ev-station-popup">
            <MarkerPopupContent station={station} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
