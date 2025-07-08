import React, { useEffect, useState } from 'react';
import type { NmapScanResult, OpenPort } from '@/types/nmap';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Server, Terminal, Shield, Clock, MapPin, Cpu, ShieldAlert } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import HttpsPanel from './components/HttpsPanel';
import { Button } from '@/components/ui/button';

const SimulationDetailPage: React.FC = () => {
  const { ip } = useParams<{ ip: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<NmapScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ip) return;
    setLoading(true);
    setError(null);
    fetch(`/api/nmap-scan?ip=${encodeURIComponent(ip)}`)
      .then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'Scan failed. Please try again.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setResult(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to connect to the scanning service.');
        setLoading(false);
      });
  }, [ip]);

  const getSeverityColor = (port: number) => {
    // Common vulnerable ports
    const criticalPorts = [21, 22, 23, 80, 443, 3389, 8080, 8443];
    const warningPorts = [25, 53, 110, 143, 161, 389, 445, 1433, 3306, 5432, 5900, 6379, 9200];
    if (criticalPorts.includes(port)) return 'bg-red-500/20 text-red-400';
    if (warningPorts.includes(port)) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-blue-500/20 text-blue-400';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <Button
                onClick={() => navigate('/simulations')}
                variant="ghost"
                className="text-gray-300 hover:text-white mb-4 md:mb-0"
              >
                <ArrowLeft className="h-5 w-5 mr-2" /> Back to Scanner
              </Button>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                Scan Results
              </h1>
              <div className="flex items-center mt-2 text-gray-400">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="font-mono text-blue-300">{ip}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                loading ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
              }`}>
                {loading ? 'Scanning...' : 'Scan Complete'}
              </span>
              <span className="text-xs text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {new Date().toLocaleString()}
              </span>
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-400">Scanning target IP address...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-6 text-center">
              <div className="flex justify-center mb-3">
                <ShieldAlert className="h-10 w-10 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-red-300 mb-2">Scan Failed</h3>
              <p className="text-red-200 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-red-500/30 text-red-300 hover:bg-red-900/50"
              >
                Retry Scan
              </Button>
            </div>
          )}

          {!loading && result && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              {/* General Information */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-2 rounded-lg bg-blue-500/10 mr-3">
                      <Globe className="h-5 w-5 text-blue-400" />
                    </div>
                    <h2 className="text-lg font-semibold">General Information</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-medium text-gray-400 mb-1">IP ADDRESS</div>
                      <div className="font-mono text-white">{ip}</div>
                    </div>
                    
                    {result.ipinfo?.country && (
                      <div>
                        <div className="text-xs font-medium text-gray-400 mb-1">LOCATION</div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{result.ipinfo.country}</span>
                          {result.ipinfo.region && <span className="text-gray-400">, {result.ipinfo.region}</span>}
                          {result.ipinfo.city && <span className="text-gray-400">, {result.ipinfo.city}</span>}
                        </div>
                      </div>
                    )}

                    {result.ipinfo?.org && (
                      <div>
                        <div className="text-xs font-medium text-gray-400 mb-1">ORGANIZATION</div>
                        <div className="flex items-center">
                          <Server className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="truncate">{result.ipinfo.org}</span>
                        </div>
                      </div>
                    )}

                    {result.ipinfo?.asn && (
                      <div>
                        <div className="text-xs font-medium text-gray-400 mb-1">ASN</div>
                        <div className="flex items-center">
                          <Cpu className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{result.ipinfo.asn}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scan Summary */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-2 rounded-lg bg-green-500/10 mr-3">
                      <Shield className="h-5 w-5 text-green-400" />
                    </div>
                    <h2 className="text-lg font-semibold">Scan Summary</h2>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                      <span className="text-sm text-gray-400">Status</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        Completed
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                      <span className="text-sm text-gray-400">Open Ports</span>
                      <span className="font-mono">{result.openPorts?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                      <span className="text-sm text-gray-400">Scan Duration</span>
                      <span>{result.scanDuration || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-400">Scanned At</span>
                      <span className="text-sm text-gray-400">
                        {new Date().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Open Ports */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
                  <div className="border-b border-gray-700/50 px-6 py-4">
                    <h2 className="text-lg font-semibold flex items-center">
                      <Server className="h-5 w-5 text-blue-400 mr-2" />
                      Open Ports
                      {result.openPorts && result.openPorts.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          {result.openPorts.length} found
                        </span>
                      )}
                    </h2>
                  </div>

                  {result.openPorts && result.openPorts.length > 0 ? (
                    <div className="divide-y divide-gray-700/50">
                      {result.openPorts.map((port, index) => (
                        <div key={index} className="p-4 hover:bg-gray-700/30 transition-colors">
                          <div className="flex items-start">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium mr-4 ${getSeverityColor(port.port)}`}>
                              {port.port}/{port.protocol}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium text-blue-300">{port.service || 'Unknown Service'}</h3>
                                <span className="text-xs px-2 py-0.5 bg-gray-700/50 rounded">
                                  {port.state}
                                </span>
                              </div>
                              {port.version && (
                                <p className="text-sm text-gray-300 mt-1 font-mono">{port.version}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-400">
                      No open ports found or the host is not responding.
                    </div>
                  )}
                </div>

                {/* Raw Output */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
                  <div className="border-b border-gray-700/50 px-6 py-4">
                    <h2 className="text-lg font-semibold flex items-center">
                      <Terminal className="h-5 w-5 text-purple-400 mr-2" />
                      Raw Scan Output
                    </h2>
                  </div>
                  <div className="p-4 bg-gray-900/50">
                    <pre className="text-xs text-gray-300 overflow-x-auto p-4 rounded-lg bg-gray-900/50 border border-gray-700/50">
                      <code>{result.raw || 'No raw output available'}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SimulationDetailPage;
