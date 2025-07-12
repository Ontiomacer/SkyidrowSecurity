import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, XCircle, CheckCircle2, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import type L from 'leaflet';

declare global {
  interface Window {
    L: typeof import('leaflet');
    tracerouteLayer?: L.Polyline<any>; // If you want to remove 'any' completely, use Polyline<any> or Polyline<any[]> if you know the structure, or Polyline<any> as a last resort for compatibility with Leaflet types.
  }
}

interface IPGeolocationData {
  query: string;
  status: 'success' | 'fail';
  message?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number; // may be undefined
  lon?: number; // may be undefined
  latitude?: number; // may be undefined
  longitude?: number; // may be undefined
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  lng?: number;
  timestamp?: number;
}

// Utility to robustly get latitude/longitude from geolocation data
function getLatLng(data: Partial<IPGeolocationData>): [number, number] | null {
  const lat = data.lat ?? data.latitude;
  const lon = data.lon ?? data.longitude ?? data.lng;
  if (typeof lat === 'number' && typeof lon === 'number') {
    return [lat, lon];
  }
  return null;
}

interface ThreatMapProps {
  ipAddress?: string;
  onLocationFound?: (data: IPGeolocationData) => void;
  onClearAll?: () => void;
  threatCount?: number;
  onThreatCountChange?: (count: number) => void;
}

const ThreatMap: React.FC<ThreatMapProps> = ({ 
  ipAddress, 
  onLocationFound, 
  onClearAll = () => {},
  threatCount = 0,
  onThreatCountChange = () => {},
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<Record<string, L.Marker>>({});
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [tracerouteResult, setTracerouteResult] = useState<string[] | null>(null);
  const [tracerouteLoading, setTracerouteLoading] = useState(false);
  const [tracerouteError, setTracerouteError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load Leaflet CSS and JS dynamically
    const loadLeaflet = () => {
      return new Promise<void>((resolve) => {
        if (window.L) {
          resolve();
          return;
        }

        // Load CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
        document.head.appendChild(cssLink);

        // Load JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    const initMap = async () => {
      await loadLeaflet();
      
      if (!mapContainer.current || map.current) return;

      // Initialize map centered on India
      map.current = window.L.map(mapContainer.current, {
        center: [20.5937, 78.9629], // India coordinates
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map.current);

      console.log('Map initialized successfully');
    };

    initMap().catch(console.error);

    return () => {
      // Cleanup
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Wrap createPulsingIcon in useCallback
  const createPulsingIcon = useCallback((color = '#ef4444') => {
    return window.L.divIcon({
      className: 'pulsing-marker',
      html: `
        <div style="
          position: relative;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            background-color: ${color};
            border-radius: 50%;
            opacity: 0.4;
            transform: scale(0.5);
            animation: pulse 2s infinite;
          "></div>
          <div style="
            width: 16px;
            height: 16px;
            background-color: ${color};
            border: 2px solid white;
            border-radius: 50%;
            position: relative;
            z-index: 1;
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(0.5); opacity: 0.4; }
            70% { transform: scale(1.5); opacity: 0; }
            100% { transform: scale(0.5); opacity: 0; }
          }
        </style>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  }, []);

  // Clear all markers from the map
  const clearAllMarkers = useCallback(() => {
    if (!window.L || !map.current) return;
    Object.values(markerRefs.current).forEach(marker => {
      map.current?.removeLayer(marker);
    });
    markerRefs.current = {};
    onThreatCountChange(0);
    onClearAll();
    // Reset map view to default (India)
    map.current.setView([20.5937, 78.9629], 5);
  }, [onClearAll, onThreatCountChange]);

  // Add a marker for an IP address
  const addIpMarker = useCallback(async (ip: string) => {

    // Basic IP validation
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
      toast({
        title: 'Invalid IP Address',
        description: 'Please enter a valid IPv4 or IPv6 address',
        variant: 'destructive'
      });
      return;
    }

    // Ensure map is initialized before proceeding
    if (!window.L || !map.current) {
      setIsLoading(false);
      toast({
        title: 'Map is not initialized',
        description: 'Please wait for the map to load before adding markers.',
        variant: 'destructive'
      });
      return;
    }

    // Check if we already have this IP
    if (markerRefs.current[ip]) {
      const marker = markerRefs.current[ip];
      map.current?.setView(marker.getLatLng(), 8, {
        animate: true,
        duration: 1
      });
      marker.openPopup();
      return;
    }

    setIsLoading(true);

    try {
      // Remove any existing marker for this IP before adding a new one
      if (markerRefs.current[ip]) {
        map.current?.removeLayer(markerRefs.current[ip]);
        delete markerRefs.current[ip];
        delete markers.current[ip];
      }

      // Use local proxy for geolocation to avoid CORS issues
      const response = await fetch(`/api/ipgeo/${ip}`);
      const data = await response.json();

      if (data.success) {
        const locationData: IPGeolocationData = {
          query: ip,
          status: 'success',
          country: data.country,
          countryCode: data.country_code || data.countryCode,
          region: data.region,
          regionName: data.region,
          city: data.city,
          zip: data.postal || data.zip,
          lat: data.latitude,
          lon: data.longitude,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
          isp: data.connection?.isp || data.isp || 'Unknown',
          org: data.connection?.org || data.org || 'Unknown',
          as: data.asn || '',
          lng: data.longitude,
          timestamp: Date.now()
        };

        const latLng = getLatLng(locationData);
        if (!latLng) throw new Error('No valid coordinates for this IP');

        // Create a marker with pulsing effect
        let marker = null;
        if (map.current) {
          marker = window.L.marker(
            latLng,
            {
              icon: createPulsingIcon(),
              title: `IP: ${ip}`,
              riseOnHover: true
            }
          ).addTo(map.current);
        } else {
          throw new Error('Map is not initialized');
        }

        // Add popup with IP info
        marker.bindPopup(`
          <div class="bg-gray-900 text-white p-3 rounded-lg shadow-lg max-w-xs">
            <div class="flex items-center space-x-2 mb-2">
              <span class="inline-block w-2 h-2 rounded-full bg-red-500"></span>
              <h3 class="text-lg font-semibold">Target IP: ${ip}</h3>
            </div>
            <div class="space-y-1 text-sm">
              <p><span class="text-gray-400">Location:</span> ${[locationData.city, locationData.regionName, locationData.country].filter(Boolean).join(', ')}</p>
              <p><span class="text-gray-400">ISP:</span> ${locationData.isp || 'Unknown'}</p>
              <p><span class="text-gray-400">Org:</span> ${locationData.org || 'Unknown'}</p>
              <p><span class="text-gray-400">Coordinates:</span> ${typeof locationData.lat === 'number' && typeof locationData.lon === 'number' ? `${locationData.lat.toFixed(4)}, ${locationData.lon.toFixed(4)}` : 'Unknown'}</p>
              <p class="text-xs text-gray-500 mt-2">${new Date(locationData.timestamp).toLocaleString()}</p>
            </div>
          </div>
        `);

        // Store the marker reference
        markers.current[ip] = marker;
        markerRefs.current[ip] = marker;

        // Always center and zoom the map on the new marker
        map.current.setView([locationData.lat, locationData.lon], 8, {
          animate: true,
          duration: 1,
          easeLinearity: 0.25
        });

        // Open the popup
        marker.openPopup();

        // Notify parent component
        if (onLocationFound) {
          onLocationFound(locationData);
        }
        // Update threat count
        const newThreatCount = Object.keys(markerRefs.current).length;
        onThreatCountChange(newThreatCount);
      } else {
        throw new Error(data.reason || 'Failed to locate IP');
      }
    } catch (error) {
      console.error('Error fetching IP geolocation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch IP geolocation',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [createPulsingIcon, onLocationFound, onThreatCountChange, toast]);

  // Utility: Plot a geolocation object on the map
  const plotGeoLocation = useCallback((geoLocation: {
    ip: string;
    country: string;
    city: string;
    latitude?: number;
    longitude?: number;
    lat?: number;
    lon?: number;
  }) => {
    if (!window.L || !map.current) return;
    // Remove any existing marker for this IP
    if (markerRefs.current[geoLocation.ip]) {
      map.current.removeLayer(markerRefs.current[geoLocation.ip]);
      delete markerRefs.current[geoLocation.ip];
      delete markers.current[geoLocation.ip];
    }
    const latLng = getLatLng(geoLocation);
    if (!latLng) return;
    const marker = window.L.marker(
      latLng,
      {
        icon: createPulsingIcon(),
        title: `IP: ${geoLocation.ip}`,
        riseOnHover: true
      }
    ).addTo(map.current);
    marker.bindPopup(
      `IP: ${geoLocation.ip}<br>Location: ${geoLocation.city}, ${geoLocation.country}`
    ).openPopup();
    markerRefs.current[geoLocation.ip] = marker;
    markers.current[geoLocation.ip] = marker;
    map.current.setView(
      latLng,
      8, {
        animate: true,
        duration: 1,
        easeLinearity: 0.25
      }
    );
  }, [createPulsingIcon, map, markerRefs, markers]);

  // Memoize the addIpMarker function to prevent unnecessary re-renders
  const memoizedAddIpMarker = useCallback((ip: string) => {
    addIpMarker(ip).catch(error => {
      console.error('Error in addIpMarker:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process IP',
        variant: 'destructive'
      });
    });
  }, [addIpMarker, toast]);

  // Traceroute handler
  const handleTraceroute = async () => {
    if (!ipAddress) return;
    setTracerouteLoading(true);
    setTracerouteResult(null);
    setTracerouteError(null);
    try {
      console.log(`[Traceroute] Starting traceroute to ${ipAddress}`);
      const response = await fetch(`/api/traceroute/${ipAddress}?t=${Date.now()}`);
      
      console.log(`[Traceroute] Response status: ${response.status}`);
      
      const rawText = await response.text();
      if (!response.ok) {
        console.error(`[Traceroute] Error response:`, rawText);
        throw new Error(`Server returned ${response.status}: ${rawText}`);
      }
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (err) {
        console.error('[Traceroute] Failed to parse JSON:', err);
        throw new Error('Failed to parse server response. Raw response: ' + rawText);
      }
      
      console.log('[Traceroute] Received data:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Traceroute failed');
      }
      // Process successful response
      if (data.hops && data.hops.length > 0) {
        console.log(`[Traceroute] Received ${data.hops.length} hops`);
        setTracerouteResult(data.hops);
        
        // Plot traceroute hops on the map
        try {
          await plotTracerouteHops(data.hops);
        } catch (plotError) {
          console.error('[Traceroute] Error plotting hops:', plotError);
          // Don't fail the whole operation if plotting fails
        }
        
        if (data.partial) {
          console.warn('[Traceroute] Partial result:', data.error);
          setTracerouteError(data.error ? `${data.error} (partial result)` : 'Partial traceroute result');
        }
      } else {
        console.warn('[Traceroute] No hops in response');
        setTracerouteError('No route found to destination');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Traceroute failed';
      console.error('[Traceroute] Error:', err);
      setTracerouteError(errorMessage);
      
      // Show error toast
      toast({
        title: 'Traceroute Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setTracerouteLoading(false);
    }
  };

  // Plot traceroute hops on the map
  const plotTracerouteHops = async (hops: string[]) => {
    if (!window.L || !map.current) return;
    // Remove previous traceroute markers/lines if any
    if (window.tracerouteLayer) {
      map.current.removeLayer(window.tracerouteLayer);
      window.tracerouteLayer = null;
    }
    const latlngs: [number, number][] = [];
    for (const line of hops.slice(0, 3)) {
      // Extract IP from line (works for both Windows and Unix output)
      const ipMatch = line.match(/(\d{1,3}(?:\.\d{1,3}){3})/);
      if (ipMatch) {
        const ip = ipMatch[1];
        try {
          // Use same base URL as addIpMarker for consistency
          const geoRes = await fetch(`/api/ipgeo/${ip}`);
          const geoData = await geoRes.json();
          if (geoData.success && geoData.latitude && geoData.longitude) {
            latlngs.push([geoData.latitude, geoData.longitude]);
          }
        } catch (e) {
          // Ignore geolocation errors for hops
        }
      }
    }
    if (latlngs.length > 1) {
      // Draw polyline for traceroute path
      window.tracerouteLayer = window.L.polyline(latlngs, { color: 'yellow', weight: 4 }).addTo(map.current);
      // Optionally, add markers for each hop
      latlngs.forEach(([lat, lng], idx) => {
        window.L.circleMarker([lat, lng], {
          radius: 7,
          color: 'yellow',
          fillColor: 'yellow',
          fillOpacity: 0.7,
        }).addTo(map.current).bindTooltip(`Hop ${idx + 1}`);
      });
      // Fit map to traceroute path
      map.current.fitBounds(latlngs);
    }
  };

  // Handle IP address changes
  useEffect(() => {
    if (!ipAddress || !window.L || !map.current) return;
    
    // Use the memoized function to handle the IP address
    memoizedAddIpMarker(ipAddress);
  }, [ipAddress, memoizedAddIpMarker]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      // Clean up marker refs
      markerRefs.current = {};
      markers.current = {};
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-700">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
        <button
          onClick={clearAllMarkers}
          disabled={Object.keys(markerRefs.current).length === 0}
          className={cn(
            'p-2 bg-gray-900/80 hover:bg-gray-800/90 text-white rounded-full shadow-lg',
            'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'flex items-center justify-center'
          )}
          title="Clear all markers"
        >
          <XCircle className="h-5 w-5" />
        </button>
        {/* Traceroute Button */}
        <button
          onClick={handleTraceroute}
          disabled={!ipAddress || tracerouteLoading}
          className={cn(
            'p-2 bg-blue-700/80 hover:bg-blue-800/90 text-white rounded-full shadow-lg',
            'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'flex items-center justify-center'
          )}
          title="Run Traceroute"
        >
          {tracerouteLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Target className="h-5 w-5" />}
        </button>
        
        {threatCount > 0 && (
          <div className="bg-red-600 text-white text-xs font-bold px-2 py-1.5 rounded-full flex items-center">
            <Target className="h-3 w-3 mr-1" />
            {threatCount} {threatCount === 1 ? 'Threat' : 'Threats'} Located
          </div>
        )}
      </div>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-gray-900/90 p-4 rounded-lg flex flex-col items-center space-y-2 max-w-xs text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <h3 className="text-white font-medium">Locating Threat</h3>
            <p className="text-gray-400 text-sm">Querying IP geolocation data...</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-full bg-gray-900"
        style={{ minHeight: '500px' }}
      />

      {/* Traceroute Modal/Panel */}
      {(tracerouteResult && tracerouteResult.length > 0) && (
        <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg max-w-2xl w-full shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setTracerouteResult(null)}
            >
              <XCircle className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Traceroute for {ipAddress}</h2>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto max-h-96 whitespace-pre-wrap">
              {tracerouteResult.slice(0, 3).map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </pre>
            {tracerouteError && (
              <div className="mt-2 text-yellow-400 text-sm">{tracerouteError}</div>
            )}
          </div>
        </div>
      )}
      {tracerouteError && (!tracerouteResult || tracerouteResult.length === 0) && (
        <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg max-w-2xl w-full shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setTracerouteError(null)}
            >
              <XCircle className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Traceroute Error</h2>
            <pre className="bg-gray-800 text-red-400 p-4 rounded overflow-x-auto max-h-96 whitespace-pre-wrap">
              {tracerouteError}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the type for use in other components
export type { IPGeolocationData };

export default ThreatMap;
