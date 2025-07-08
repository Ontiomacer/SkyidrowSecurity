import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ThreatMap from './ThreatMap';
import ThreatLogTable from './ThreatLogTable';

export interface ThreatLocation {
  id: string;
  ip: string;
  lat?: number;
  lon?: number;
  latitude?: number;
  longitude?: number;
  lng?: number;
  city: string;
  country: string;
  region: string;
  isp: string;
  org: string;
  timezone: string | { id?: string; utc?: string; offset?: number; abbr?: string; is_dst?: boolean; current_time?: string } | null;
  timestamp: Date;
  status: 'success' | 'fail';
  query: string;
}

const LOCAL_STORAGE_KEY = 'threatMapHistory';

const ThreatMapDashboard: React.FC = () => {
  const [ipInput, setIpInput] = useState('');
  const [threats, setThreats] = useState<ThreatLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setThreats(parsed.map(t => ({ ...t, timestamp: t.timestamp ? new Date(t.timestamp) : new Date() })));
        }
      }
    } catch (e) {
      // Ignore parse errors, start empty
      setThreats([]);
    }
  }, []);

  const validateIP = (ip: string): boolean => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const locateThreat = async () => {
    if (!ipInput.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter an IP address",
        variant: "destructive"
      });
      return;
    }

    if (!validateIP(ipInput.trim())) {
      toast({
        title: "Invalid IP Format",
        description: "Please enter a valid IPv4 address (e.g., 8.8.8.8)",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log(`Fetching geolocation for IP: ${ipInput}`);
      
      const response = await fetch(`http://localhost:5001/api/ipgeo/${ipInput.trim()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('IP-API response:', data);

      if (data.status === 'fail') {
        toast({
          title: "Location Failed",
          description: data.message || "Could not locate this IP address",
          variant: "destructive"
        });
        return;
      }

      const newThreat: ThreatLocation = {
        id: Date.now().toString(),
        ip: data.ip || data.query || ipInput.trim(),
        lat: data.latitude, // ipwho.is uses 'latitude'
        lon: data.longitude, // ipwho.is uses 'longitude'
        city: data.city || 'Unknown',
        country: data.country || 'Unknown',
        region: data.region || 'Unknown',
        isp: data.connection?.isp || data.isp || 'Unknown',
        org: data.connection?.org || data.org || 'Unknown',
        timezone: data.timezone || 'Unknown',
        timestamp: new Date(),
        status: data.success ? 'success' : 'fail',
        query: ipInput.trim()
      };


      setThreats(prev => {
        const updated = [...prev, newThreat];
        // Keep only last 5
        const sliced = updated.slice(-5);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sliced));
        return sliced;
      });
      setIpInput('');

      toast({
        title: "Threat Located",
        description: `IP ${data.query} located in ${data.city}, ${data.country}`,
        variant: "default"
      });

    } catch (error) {
      console.error('Error fetching IP location:', error);
      toast({
        title: "Error",
        description: "Failed to fetch IP location. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllThreats = () => {
    setThreats([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast({
      title: "Cleared",
      description: "All threat markers and history have been removed",
      variant: "default"
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      locateThreat();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="h-8 w-8 text-red-500" />
        <h1 className="text-3xl font-bold gradient-text">Threat Location Intelligence</h1>
      </div>

      {/* Controls */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Search className="h-5 w-5" />
            IP Threat Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter IP address (e.g., 8.8.8.8)"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              disabled={isLoading}
            />
            <Button 
              onClick={locateThreat}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Locating...' : 'Locate Threat'}
            </Button>
            {threats.length > 0 && (
              <Button 
                onClick={clearAllThreats}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-600">
                {threats.length} Threats Located
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Rate Limit: 45 queries/minute
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Threat Visualization Map</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ThreatMap 
            threatCount={threats.length}
            ipAddress={threats[threats.length - 1]?.ip}
          />
        </CardContent>
      </Card>

      {/* Threat Log Table */}
      {threats.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Threat Intelligence Log</CardTitle>
            <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700" onClick={clearAllThreats}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </CardHeader>
          <CardContent>
            <ThreatLogTable threats={threats} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ThreatMapDashboard;
