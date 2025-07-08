
import React, { useEffect, useRef } from 'react';
import { ThreatData } from './ThreatIntelligenceExplorer';

declare global {
  interface Window {
    L: any;
  }
}

interface ThreatGlobeMapProps {
  threats: ThreatData[];
  selectedRegion: string;
}

const ThreatGlobeMap: React.FC<ThreatGlobeMapProps> = ({ threats, selectedRegion }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);

  const regionCenters = {
    global: [20, 0],
    asia: [30, 100],
    europe: [50, 10],
    americas: [35, -100],
    africa: [0, 20]
  };

  useEffect(() => {
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

      const center = regionCenters[selectedRegion as keyof typeof regionCenters] || regionCenters.global;
      
      // Initialize map
      map.current = window.L.map(mapContainer.current, {
        center: center,
        zoom: selectedRegion === 'global' ? 2 : 4,
        zoomControl: true,
        scrollWheelZoom: true,
        worldCopyJump: true
      });

      // Use dark theme tiles
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CARTO',
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map.current);

      console.log('Dark theme map initialized successfully');
    };

    initMap().catch(console.error);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [selectedRegion]);

  useEffect(() => {
    if (!map.current || !window.L) return;

    // Clear existing markers
    markers.current.forEach(marker => {
      map.current.removeLayer(marker);
    });
    markers.current = [];

    // Add new markers for each threat
    threats.forEach((threat, index) => {
      const getMarkerColor = (level: string) => {
        switch (level) {
          case 'safe': return '#10b981'; // green
          case 'suspicious': return '#f59e0b'; // yellow
          case 'malicious': return '#ef4444'; // red
          default: return '#6b7280'; // gray
        }
      };

      const color = getMarkerColor(threat.threatLevel);

      const customIcon = window.L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background: linear-gradient(135deg, ${color}, ${color}dd);
            border: 3px solid #ffffff;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 4px ${color}33;
            color: white;
            font-size: 14px;
            font-weight: bold;
            animation: pulse 2s infinite;
          ">
            ${index + 1}
          </div>
          <style>
            @keyframes pulse {
              0% { box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 4px ${color}33; }
              50% { box-shadow: 0 4px 12px rgba(0,0,0,0.6), 0 0 0 8px ${color}44; }
              100% { box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 4px ${color}33; }
            }
          </style>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = window.L.marker([threat.location.lat, threat.location.lon], { icon: customIcon });
      
      const vtInfo = threat.virustotal ? `
        <div style="margin-top: 12px; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 6px;">
          <div style="color: #ef4444; font-weight: bold; margin-bottom: 4px;">🛡️ VirusTotal Analysis</div>
          <div style="font-size: 12px; line-height: 1.4;">
            <div>Malicious: <span style="color: #ef4444;">${threat.virustotal.malicious}</span></div>
            <div>Suspicious: <span style="color: #f59e0b;">${threat.virustotal.suspicious}</span></div>
            <div>Harmless: <span style="color: #10b981;">${threat.virustotal.harmless}</span></div>
            <div>Last Analysis: ${threat.virustotal.lastAnalysis}</div>
            <div>Network: ${threat.virustotal.network}</div>
            <a href="${threat.virustotal.reportUrl}" target="_blank" style="color: #3b82f6; text-decoration: underline;">
              View Full Report ↗
            </a>
          </div>
        </div>
      ` : `
        <div style="margin-top: 8px; padding: 6px; background: rgba(0,0,0,0.3); border-radius: 6px; font-size: 11px; color: #fbbf24;">
          ⚠️ VirusTotal data unavailable
        </div>
      `;

      const popupContent = `
        <div style="
          min-width: 280px;
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          color: white;
          padding: 16px;
          border-radius: 12px;
          border: 2px solid ${color};
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            color: ${color};
            font-weight: bold;
            font-size: 18px;
          ">
            🎯 THREAT INTELLIGENCE
            <span style="
              background: ${color};
              color: white;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 10px;
              text-transform: uppercase;
            ">
              ${threat.threatLevel}
            </span>
          </div>
          
          <div style="display: grid; gap: 8px; font-size: 14px;">
            <div><strong style="color: #f87171;">IP Address:</strong> ${threat.ip}</div>
            <div><strong style="color: #f87171;">Location:</strong> ${threat.location.city}, ${threat.location.country}</div>
            <div><strong style="color: #f87171;">Region:</strong> ${threat.location.region}</div>
            <div><strong style="color: #f87171;">ISP:</strong> ${threat.location.isp}</div>
            <div><strong style="color: #f87171;">Timezone:</strong> ${threat.location.timezone}</div>
            <div><strong style="color: #f87171;">Analyzed:</strong> ${threat.timestamp.toLocaleString()}</div>
          </div>
          
          ${vtInfo}
          
          <div style="
            margin-top: 12px;
            padding: 8px;
            background: rgba(0,0,0,0.2);
            border-radius: 6px;
            border-left: 3px solid ${color};
            font-size: 11px;
            color: #d1d5db;
          ">
            📍 Coordinates: ${threat.location.lat.toFixed(4)}, ${threat.location.lon.toFixed(4)}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 320,
        className: 'threat-popup'
      });

      marker.addTo(map.current);
      markers.current.push(marker);

      console.log(`Added ${threat.threatLevel} marker for ${threat.ip} at ${threat.location.lat}, ${threat.location.lon}`);
    });

    // Fit map to show all markers or center on region
    if (threats.length > 0) {
      const group = new window.L.featureGroup(markers.current);
      const bounds = group.getBounds();
      if (bounds.isValid()) {
        map.current.fitBounds(bounds.pad(0.1));
      }
    } else {
      const center = regionCenters[selectedRegion as keyof typeof regionCenters] || regionCenters.global;
      map.current.setView(center, selectedRegion === 'global' ? 2 : 4);
    }
  }, [threats, selectedRegion]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-[600px] rounded-lg"
      style={{ minHeight: '600px' }}
    />
  );
};

export default ThreatGlobeMap;
