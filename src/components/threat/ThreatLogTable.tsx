import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Globe, Building } from 'lucide-react';
import { ThreatLocation } from './ThreatMapDashboard';

interface ThreatLogTableProps {
  threats: ThreatLocation[];
}

const ThreatLogTable: React.FC<ThreatLogTableProps> = ({ threats }) => {
  const getRegionColor = (country: string) => {
    const colors = {
      'United States': 'bg-blue-600',
      'China': 'bg-red-600',
      'Russia': 'bg-purple-600',
      'Germany': 'bg-green-600',
      'United Kingdom': 'bg-yellow-600',
      'India': 'bg-orange-600',
      'Canada': 'bg-pink-600',
      'Australia': 'bg-teal-600',
    };
    return colors[country as keyof typeof colors] || 'bg-gray-600';
  };

  // Utility to robustly get latitude/longitude from geolocation data
  function getLatLng(data: Partial<ThreatLocation>): [number, number] | null {
    const lat = data.lat ?? data.latitude;
    const lon = data.lon ?? data.longitude ?? data.lng;
    if (typeof lat === 'number' && typeof lon === 'number') {
      return [lat, lon];
    }
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-800">
            <TableHead className="text-gray-300">#</TableHead>
            <TableHead className="text-gray-300">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                IP Address
              </div>
            </TableHead>
            <TableHead className="text-gray-300">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </div>
            </TableHead>
            <TableHead className="text-gray-300">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                ISP/Organization
              </div>
            </TableHead>
            <TableHead className="text-gray-300">Coordinates</TableHead>
            <TableHead className="text-gray-300">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timestamp
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {threats.map((threat, index) => (
            <TableRow 
              key={threat.id} 
              className="border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <TableCell className="text-gray-400 font-mono">
                {String(index + 1).padStart(2, '0')}
              </TableCell>
              
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-red-400 font-bold">
                    {threat.ip}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className="w-fit text-xs bg-red-600 text-white"
                  >
                    THREAT
                  </Badge>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={`text-white ${getRegionColor(threat.country)}`}
                    >
                      {threat.country}
                    </Badge>
                  </div>
                  <span className="text-gray-300 text-sm">
                    {threat.city}, {threat.region}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {typeof threat.timezone === 'object' && threat.timezone
                      ? (threat.timezone.id || threat.timezone.utc || '')
                      : (typeof threat.timezone === 'string' ? threat.timezone : '')}
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-300 font-medium">
                    {threat.isp}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {threat.org}
                  </span>
                </div>
              </TableCell>
              
              <TableCell className="font-mono text-sm text-gray-400">
                <div className="flex flex-col">
                  <span>Lat: {getLatLng(threat)?.[0]?.toFixed(4) ?? 'N/A'}</span>
                  <span>Lng: {getLatLng(threat)?.[1]?.toFixed(4) ?? 'N/A'}</span>
                </div>
              </TableCell>
              
              <TableCell className="text-gray-400 text-sm">
                <div className="flex flex-col">
                  <span>{threat.timestamp.toLocaleDateString()}</span>
                  <span className="text-xs text-gray-500">
                    {threat.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {threats.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No threats located yet. Enter an IP address to start mapping threats.</p>
        </div>
      )}
    </div>
  );
};

export default ThreatLogTable;
