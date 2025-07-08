
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Upload, Zap, Shield, Globe, Server, Loader2, AlertCircle, FileText } from 'lucide-react';
import Layout from '@/components/layout/Layout';

const validateIP = (ip: string): boolean => {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

const exampleIPs = ['8.8.8.8', '1.1.1.1', '185.199.108.153', '203.0.113.99', '208.67.222.222'];

const wordlists = [
  { label: 'Common (default)', value: 'common.txt' },
  { label: 'Big', value: 'big.txt' },
  { label: 'Admin', value: 'admin.txt' },
];

interface RecentScan {
  ip: string;
  lat: number;
  lng: number;
  label: string;
}

const SimulationsPage: React.FC = () => {
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWordlist, setSelectedWordlist] = useState(wordlists[0].value);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleScan = async () => {
    setError(null);
    if (!ip.trim()) {
      setError('Please enter an IP address');
      return;
    }
    if (!validateIP(ip.trim())) {
      setError('Invalid IPv4 address');
      return;
    }
    setLoading(true);
    try {
      navigate(`/simulations/results/${ip.trim()}?wordlist=${encodeURIComponent(selectedWordlist)}`);
    } catch (e) {
      setError('Failed to start scan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-900/30 rounded-full border border-blue-500/30 mb-6">
              <Zap className="h-5 w-5 text-blue-400 mr-2" />
              <span className="text-blue-300 text-sm font-medium">Advanced Threat Simulation</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              IP Intelligence Scanner
            </h1>
            <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
              Analyze open ports, HTTP headers, geolocation, and potential vulnerabilities for any public IP address.
            </p>
          </div>

          {/* Search Card */}
          <div className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-blue-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                className="block w-full pl-10 pr-36 py-4 bg-gray-900/70 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
                placeholder="Enter IP address (e.g., 8.8.8.8)"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                disabled={loading}
                autoFocus
              />
              <button
                className="absolute inset-y-0 right-0 px-6 flex items-center bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-r-xl hover:from-blue-500 hover:to-blue-400 transition-all duration-200"
                onClick={handleScan}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Scan
                  </span>
                )}
              </button>
            </div>

            {/* Quick IPs */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-400 self-center">Try:</span>
              {exampleIPs.map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setIp(ex);
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }}
                  className="text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 px-3 py-1 rounded-full transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>

            {/* Wordlist Selection */}
            <div className="mt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="wordlist" className="block text-sm font-medium text-gray-300 mb-1">
                    Wordlist
                  </label>
                  <div className="relative">
                    <select
                      id="wordlist"
                      className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-xl px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      value={selectedWordlist}
                      onChange={(e) => setSelectedWordlist(e.target.value)}
                      disabled={loading || uploading}
                    >
                      {wordlists.map((wl) => (
                        <option key={wl.value} value={wl.value}>
                          {wl.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <FileText className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Custom Wordlist</label>
                  <label
                    className={`flex items-center justify-center w-full px-4 py-2.5 border-2 border-dashed rounded-xl cursor-pointer ${
                      uploading ? 'border-blue-500/50 bg-blue-900/20' : 'border-gray-600 hover:border-blue-500/50'
                    } transition-colors`}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2 text-blue-400" />
                    )}
                    <span className="text-sm text-gray-300">
                      {uploading ? 'Uploading...' : 'Upload Custom Wordlist'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".txt"
                      disabled={loading || uploading}
                      onChange={async (e) => {
                        setUploadError(null);
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!file.name.endsWith('.txt')) {
                          setUploadError('Only .txt files allowed');
                          return;
                        }
                        setUploading(true);
                        const formData = new FormData();
                        formData.append('wordlist', file);
                        try {
                          const res = await fetch('/api/upload-wordlist', {
                            method: 'POST',
                            body: formData,
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'Upload failed');
                          setSelectedWordlist(data.filename);
                        } catch (err: any) {
                          setUploadError(err.message || 'Upload failed');
                        } finally {
                          setUploading(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              {uploadError && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> {uploadError}
                </p>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" /> {error}
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: <Globe className="h-8 w-8 text-blue-400" />,
                title: "Global Coverage",
                description: "Scan IP addresses from anywhere in the world with our distributed scanning network."
              },
              {
                icon: <Shield className="h-8 w-8 text-green-400" />,
                title: "Security Focused",
                description: "Identify potential security vulnerabilities and misconfigurations in your network."
              },
              {
                icon: <Server className="h-8 w-8 text-purple-400" />,
                title: "Deep Analysis",
                description: "Get detailed information about open ports, services, and potential attack surfaces."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SimulationsPage;
