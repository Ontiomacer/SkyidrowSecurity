import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import SatelliteMap, { MapMarker } from '@/components/ui/SatelliteMap';
import { Button } from '@/components/ui/button';

// Mock recent simulations for the map
const recentSimulations: MapMarker[] = [
  { ip: '8.8.8.8', lat: 37.751, lng: -97.822, label: 'Google DNS' },
  { ip: '1.1.1.1', lat: -33.494, lng: 143.2104, label: 'Cloudflare DNS' },
  { ip: '208.67.222.222', lat: 37.4056, lng: -122.0775, label: 'OpenDNS' },
];

const validateIP = (ip: string): boolean => {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

const SimulationsMainPage: React.FC = () => {
  const [ip, setIp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!ip.trim()) {
      setError('Please enter an IP address.');
      return;
    }
    if (!validateIP(ip.trim())) {
      setError('Invalid IPv4 address.');
      return;
    }
    navigate(`/simulations/${ip.trim()}`);
  };

  return (
    <Layout>
      <div className="bg-[#0a0c10] min-h-screen w-full font-mono flex flex-col items-center">
        <div className="h-8" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#ff3860] mb-8 tracking-widest">Nmap Simulations</h1>
        <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto flex flex-col items-center gap-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#ff3860]" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-16 py-4 bg-[#181c23] border-2 border-[#23272e] rounded-xl text-[#ff3860] placeholder-[#ff3860]/60 focus:outline-none focus:ring-2 focus:ring-[#ff3860] focus:border-[#ff3860] text-2xl font-mono tracking-widest shadow-lg transition-all duration-200"
              placeholder="Enter IP address (e.g., 8.8.8.8)"
              value={ip}
              onChange={e => setIp(e.target.value)}
              autoFocus
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <Button
                className="h-full bg-[#ff3860] hover:bg-[#ff3860]/90 text-white px-10 rounded-l-none rounded-r-xl text-xl font-extrabold shadow-lg"
                type="submit"
              >
                Scan
              </Button>
            </div>
          </div>
          {error && (
            <div className="flex items-center text-[#ff3860] text-lg font-bold">{error}</div>
          )}
        </form>
        <div className="h-8" />
        <div className="w-full max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-[#181c23] to-[#10141a] rounded-2xl border-2 border-[#23272e] shadow-2xl p-4">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-[#00aaff]">Recent Simulations Map</span>
            </h2>
            {/* Replace with a real Leaflet map in production */}
            <div className="w-full h-[320px] rounded-xl overflow-hidden relative">
              <SatelliteMap markers={recentSimulations} />
              {/* Optionally, show marker tooltips or a legend */}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {recentSimulations.map((sim, i) => (
                <div key={i} className="bg-[#23272e] text-white px-4 py-2 rounded-lg font-mono text-sm flex items-center gap-2">
                  <span className="text-[#ff3860] font-bold">{sim.ip}</span>
                  <span className="text-gray-400">{sim.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SimulationsMainPage;
