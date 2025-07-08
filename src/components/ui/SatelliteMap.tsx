import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export type MapMarker = {
  ip: string;
  lat: number;
  lng: number;
  label: string;
};

interface SatelliteMapProps {
  markers?: MapMarker[];
}

const defaultMarkers: MapMarker[] = [
  { ip: '8.8.8.8', lat: 37.751, lng: -97.822, label: 'Google DNS' },
  { ip: '1.1.1.1', lat: -33.494, lng: 143.2104, label: 'Cloudflare DNS' },
  { ip: '208.67.222.222', lat: 37.4056, lng: -122.0775, label: 'OpenDNS' },
];

const SatelliteMap: React.FC<SatelliteMapProps> = ({ markers = defaultMarkers }) => {
  // Center on first marker or fallback
  const center = markers.length > 0 ? [markers[0].lat, markers[0].lng] : [37.977978, -122.031073];
  return (
    <div className="relative w-full h-[300px] rounded-lg overflow-hidden my-6">
      <MapContainer
        center={center as [number, number]}
        zoom={2}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        style={{ filter: 'brightness(0.7) contrast(1.2)' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {markers.map(marker => (
          <Marker key={marker.ip} position={[marker.lat, marker.lng]}>
            <Popup>{marker.label} ({marker.ip})</Popup>
          </Marker>
        ))}
      </MapContainer>
      {/* Overlay for dark contrast */}
      <div className="absolute inset-0 bg-black bg-opacity-60 pointer-events-none z-10" />
      {/* Marker labels (optional) */}
      {markers.map(marker => (
        <div
          key={marker.ip}
          className="absolute z-20 text-xs text-white font-bold drop-shadow-lg"

          // This is a placeholder for label positioning logic
          // In production, use a real projection to place labels
          style={{ left: '10px', top: '10px', display: 'none' }}
        >
          {marker.label}
        </div>
      ))}
    </div>
  );
};

export default SatelliteMap;
