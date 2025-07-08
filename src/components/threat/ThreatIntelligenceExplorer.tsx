import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Shield, 
  Globe, 
  BarChart3, 
  Settings, 
  Sun, 
  Moon,
  Activity,
  Menu,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  Target,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { detectQueryType } from '@/lib/utils/queryDetector';
import type { QueryType } from '@/types/threatIntel';
import { getThreatIntelligence } from '@/lib/threatIntelligence';
import type { ThreatIntelligenceResponse } from '@/types/threatIntel';
import { useAuth } from '@/contexts/AuthContext';

// Lazy load the ThreatMap component
const ThreatMap = lazy(() => import('./ThreatMap')) as React.LazyExoticComponent<React.ComponentType<{
  ipAddress?: string;
  onLocationFound?: (data: IPGeolocationData) => void;
  onClearAll?: () => void;
  threatCount?: number;
  onThreatCountChange?: (count: number) => void;
  onRateLimitChange?: (limited: boolean) => void;
  onQueryCountChange?: (count: number) => void;
}>>;

// Loading component for Suspense
const MapLoading = () => (
  <div className="h-[600px] w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <p>Loading map...</p>
  </div>
);

// Import the IPGeolocationData type from ThreatMap
interface IPGeolocationData {
  query: string;
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  lng?: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  message?: string; // Optional error message
}

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  active: boolean;
}

interface ThreatData {
  id: string;
  type: 'ip' | 'domain' | 'url' | 'hash' | 'email';
  value: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  firstSeen: string;
  lastSeen: string;
  sources: string[];
  tags: string[];
  description?: string;
  location?: {
    lat: number;
    lng: number;
    country?: string;
    region?: string;
    city?: string;
  };
}

interface RecentSearch {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
  type: 'search' | 'ip';
}

// Interface for threat location data
interface ThreatLocation {
  id: string;
  lat: number;
  lng: number;
  type: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
}

// Define a type for SerpAPI results
interface SerpApiOrganicResult {
  title: string;
  link: string;
  displayed_link?: string;
  snippet?: string;
}

const ThreatIntelligenceExplorer: React.FC = () => {
  // Return the JSX directly
  return <ThreatIntelligenceExplorerContent />;
};

const ThreatIntelligenceExplorerContent: React.FC = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [threats, setThreats] = useState<ThreatData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'map' | 'analytics' | 'serp'>('search');
  const [mapIpAddress, setMapIpAddress] = useState<string>('');
  const [ipLocationData, setIpLocationData] = useState<IPGeolocationData | null>(null);
  const [threatMarkers, setThreatMarkers] = useState<{[key: string]: IPGeolocationData}>({});
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [queryCount, setQueryCount] = useState(0);
  const [searchResults, setSearchResults] = useState<ThreatIntelligenceResponse | null>(null);
  const [serpResults, setSerpResults] = useState<{ organic_results?: SerpApiOrganicResult[] } | null>(null);
  const [serpError, setSerpError] = useState<string | null>(null);
  // Store scan/search history for analysis
  interface ScanRecord {
    query: string;
    type: string;
    timestamp: string;
    result: string;
  }
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const { currentUser, logout, login } = useAuth();
  const [showUserSwitch, setShowUserSwitch] = useState(false);
  const [switchUsername, setSwitchUsername] = useState('');
  const [switchPassword, setSwitchPassword] = useState('');
  const [switchError, setSwitchError] = useState('');

  // Hooks
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Navigation items for sidebar
  const navItems: NavItem[] = [
    { name: 'Dashboard', icon: <Activity className="w-5 h-5" />, path: '/dashboard', active: false },
    { name: 'Threat Map', icon: <Globe className="w-5 h-5" />, path: '/threat-map', active: true },
    { name: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, path: '/analytics', active: false },
    { name: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings', active: false },
  ];
  
  // Enhanced domain-to-IP resolver: try backend, then fallback to Cloudflare DNS-over-HTTPS
  const resolveDomainToIp = async (domain: string): Promise<string | null> => {
    // Try backend first
    try {
      const res = await fetch(`/api/resolve-domain?domain=${encodeURIComponent(domain)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.ip) return data.ip;
      }
    } catch (e) { /* ignore */ }
    // Fallback to Cloudflare DNS-over-HTTPS
    try {
      const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`, {
        headers: { 'accept': 'application/dns-json' }
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.Answer && data.Answer.length > 0) {
        const ip = data.Answer.find((a: { type: number }) => a.type === 1)?.data;
        return ip || null;
      }
    } catch (e) { /* ignore */ }
    return null;
  };

  const extractCveId = (query: string): string | null => {
    // Match CVE IDs like CVE-2025-29927 (case-insensitive, with or without dash)
    const match = query.match(/cve[-_ ]?(\d{4})[-_ ]?(\d{4,7})/i);
    if (match) {
      return `CVE-${match[1]}-${match[2]}`;
    }
    return null;
  };

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      toast({
        title: 'Search query is empty',
        description: 'Please enter a search term or IP address',
        variant: 'destructive',
      });
      return;
    }
    // --- CVE extraction logic ---
    const cveId = extractCveId(query);
    let type = detectQueryType(query) as QueryType | 'email' | 'keyword';
    if (cveId) {
      type = 'cve';
    }
    if (!type) {
      if (/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(query)) {
        type = 'email';
      } else {
        type = 'keyword';
      }
    }
    if (type === 'ip') {
      setActiveTab('map');
      setMapIpAddress(query);
      const newSearch: RecentSearch = {
        id: Date.now().toString(),
        query: `IP: ${query}`,
        timestamp: new Date().toISOString(),
        resultCount: 1,
        type: 'ip'
      };
      setRecentSearches(prev => [newSearch, ...prev].slice(0, 5));
      setScanHistory(prev => [{ query, type: 'ip', timestamp: new Date().toISOString(), result: 'IP Plotted' }, ...prev]);
      setSearchQuery('');
      return;
    }
    if (type === 'domain') {
      setIsLoading(true);
      try {
        let results: ThreatIntelligenceResponse | null = null;
        results = await getThreatIntelligence(query, 'domain');
        const newSearch: RecentSearch = {
          id: Date.now().toString(),
          query: searchQuery,
          timestamp: new Date().toISOString(),
          resultCount: results && results.data && results.data.tags ? results.data.tags.length : 1,
          type: 'search'
        };
        setRecentSearches(prev => [newSearch, ...prev].slice(0, 5));
        setSearchQuery('');
        setSearchResults(results);
        // Now resolve domain to IP and plot
        const ip = await resolveDomainToIp(query);
        if (ip) {
          setMapIpAddress(ip); // set IP first
          setTimeout(() => setActiveTab('map'), 100); // then switch tab after a short delay
          toast({
            title: 'Domain resolved',
            description: `Domain ${query} resolved to IP: ${ip} and plotted on map`,
            variant: 'default',
          });
          setScanHistory(prev => [{ query, type: 'domain', timestamp: new Date().toISOString(), result: `Resolved to IP: ${ip}` }, ...prev]);
        } else {
          toast({
            title: 'Domain resolution failed',
            description: `Could not resolve IP for domain: ${query}`,
            variant: 'destructive',
          });
          setScanHistory(prev => [{ query, type: 'domain', timestamp: new Date().toISOString(), result: 'Domain resolution failed' }, ...prev]);
        }
      } catch (error) {
        toast({
          title: 'Search failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive',
        });
        setScanHistory(prev => [{ query, type: 'domain', timestamp: new Date().toISOString(), result: 'Error' }, ...prev]);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (type === 'cve') {
      setIsLoading(true);
      try {
        let results: ThreatIntelligenceResponse | null = null;
        // Use extracted CVE ID if present
        const cveQuery = cveId || query;
        results = await getThreatIntelligence(cveQuery, 'cve');
        const newSearch: RecentSearch = {
          id: Date.now().toString(),
          query: cveQuery,
          timestamp: new Date().toISOString(),
          resultCount: results && results.data && results.data.tags ? results.data.tags.length : 1,
          type: 'cve'
        };
        setRecentSearches(prev => [newSearch, ...prev].slice(0, 5));
        setSearchQuery('');
        setSearchResults(results);
        toast({
          title: 'CVE Details Fetched',
          description: `Detailed information for CVE: ${cveQuery} loaded below.`,
          variant: 'default',
        });
        setScanHistory(prev => [{ query: cveQuery, type: 'cve', timestamp: new Date().toISOString(), result: 'CVE details loaded' }, ...prev]);
      } catch (error) {
        toast({
          title: 'CVE Lookup Failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive',
        });
        setScanHistory(prev => [{ query, type: 'cve', timestamp: new Date().toISOString(), result: 'Error' }, ...prev]);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    setIsLoading(true);
    try {
      let results: ThreatIntelligenceResponse | null = null;
      if (["cve", "hash", "domain", "url", "ip"].includes(type)) {
        results = await getThreatIntelligence(query, type as QueryType);
      } else if (type === 'email' || type === 'keyword') {
        results = { success: true, data: { type: 'domain', query, sources: [], malicious: false, score: 0, details: {}, tags: [] } };
      }
      const newSearch: RecentSearch = {
        id: Date.now().toString(),
        query: searchQuery,
        timestamp: new Date().toISOString(),
        resultCount: results && results.data && results.data.tags ? results.data.tags.length : 1,
        type: 'search'
      };
      setRecentSearches(prev => [newSearch, ...prev].slice(0, 5));
      setScanHistory(prev => [{ query, type, timestamp: new Date().toISOString(), result: results?.success ? 'Success' : 'Error' }, ...prev]);
      setSearchQuery('');
      setSearchResults(results);
    } catch (error) {
      toast({
        title: 'Search failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      setScanHistory(prev => [{ query, type, timestamp: new Date().toISOString(), result: 'Error' }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const validateIP = (ip: string): boolean => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const determineThreatLevel = (): 'safe' | 'suspicious' | 'malicious' => {
    // Simple random threat level for demo purposes
    const levels: ('safe' | 'suspicious' | 'malicious')[] = ['safe', 'suspicious', 'malicious'];
    return levels[Math.floor(Math.random() * levels.length)];
  };

  const resetMap = () => {
    setThreats([]);
    setSearchQuery('');
    toast({
      title: "Map Reset",
      description: "All threat markers have been cleared",
      variant: "default"
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle IP location found event from map
  const handleLocationFound = useCallback((data: IPGeolocationData) => {
    if (data.status === 'success') {
      setIpLocationData(prev => ({
        ...prev,
        ...data,
        timestamp: Date.now()
      }));
      
      setThreatMarkers(prev => ({
        ...prev,
        [data.query]: {
          ...data,
          timestamp: Date.now()
        }
      }));
      
      toast({
        title: 'Threat Located',
        description: `Successfully located IP: ${data.query}`,
        variant: 'default'
      });
    } else {
      toast({
        title: 'Location Error',
        description: data.message || 'Failed to locate IP',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Handle rate limit changes
  const handleRateLimitChange = (limited: boolean) => {
    setIsRateLimited(limited);
  };

  // Handle query count updates
  const handleQueryCountChange = (count: number) => {
    setQueryCount(count);
  };

  // Clear all markers
  const handleClearAll = () => {
    setThreatMarkers({});
    setIpLocationData(null);
  };

  // --- Unique Modern Analytics Page ---
  const AnalyticsPage: React.FC = () => {
    // Calculate stats
    const total = scanHistory.length;
    const byType: Record<string, number> = {};
    const byResult: Record<string, number> = {};
    let topQuery = '';
    let topQueryCount = 0;
    scanHistory.forEach(s => {
      byType[s.type] = (byType[s.type] || 0) + 1;
      byResult[s.result] = (byResult[s.result] || 0) + 1;
      if (byType[s.type] > topQueryCount) {
        topQuery = s.type;
        topQueryCount = byType[s.type];
      }
    });
    const successRate = total ? Math.round(100 * (byResult['Success'] || byResult['CVE details loaded'] || 0) / total) : 0;
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight drop-shadow-lg">Threat Intelligence Analytics</h1>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-gradient-to-tr from-blue-900 to-blue-600 rounded-xl p-6 shadow-lg flex flex-col items-center">
              <span className="text-3xl font-bold text-white">{total}</span>
              <span className="text-blue-200 mt-2">Total Searches</span>
            </div>
            <div className="bg-gradient-to-tr from-purple-900 to-purple-600 rounded-xl p-6 shadow-lg flex flex-col items-center">
              <span className="text-3xl font-bold text-white">{Object.keys(byType).length}</span>
              <span className="text-purple-200 mt-2">Query Types</span>
            </div>
            <div className="bg-gradient-to-tr from-green-900 to-green-600 rounded-xl p-6 shadow-lg flex flex-col items-center">
              <span className="text-3xl font-bold text-white">{topQuery || 'N/A'}</span>
              <span className="text-green-200 mt-2">Most Common Type</span>
            </div>
            <div className="bg-gradient-to-tr from-yellow-900 to-yellow-600 rounded-xl p-6 shadow-lg flex flex-col items-center">
              <span className="text-3xl font-bold text-white">{successRate}%</span>
              <span className="text-yellow-200 mt-2">Success Rate</span>
            </div>
          </div>
          {/* Analytics Table */}
          <div className="bg-white/10 rounded-2xl shadow-xl p-8 mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Search History</h2>
            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gradient-to-r from-[#232526] to-[#0f2027]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Query</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">Result</th>
                  </tr>
                </thead>
                <tbody className="bg-gradient-to-br from-[#232526]/60 to-[#0f2027]/60 divide-y divide-gray-800">
                  {scanHistory.length === 0 && (
                    <tr><td colSpan={4} className="text-center text-gray-400 py-6">No scans yet</td></tr>
                  )}
                  {scanHistory.map((scan, idx) => (
                    <tr key={idx} className="hover:bg-blue-900/30 transition-all">
                      <td className="px-6 py-4 text-blue-100 font-semibold">{scan.query}</td>
                      <td className="px-6 py-4 text-purple-200">{scan.type}</td>
                      <td className="px-6 py-4 text-gray-300">{new Date(scan.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4 text-green-200">{scan.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Unique Footer */}
          <div className="mt-16 text-center text-blue-200/70 text-xs tracking-widest uppercase">
            <span className="inline-block bg-gradient-to-r from-blue-700 via-purple-700 to-green-700 px-4 py-2 rounded-full shadow-lg animate-pulse">Skyidrow Threat Nexus &mdash; Analytics Portal</span>
          </div>
        </div>
      </div>
    );
  };

  // --- Keyword Extraction Logic ---
  // Extract keywords from the search query for display below the search bar
  const extractKeywords = (query: string): string[] => {
    // Remove special chars, split by space, filter out short/stopwords
    const stopwords = [
      'the', 'and', 'or', 'for', 'with', 'from', 'this', 'that', 'are', 'was', 'were', 'has', 'have', 'had', 'not', 'but', 'you', 'your', 'can', 'will', 'all', 'any', 'etc', 'etc.', 'to', 'of', 'in', 'on', 'at', 'by', 'as', 'an', 'a', 'is', 'it', 'be', 'if', 'do', 'does', 'did', 'so', 'we', 'i', 'me', 'my', 'our', 'us', 'their', 'they', 'them', 'he', 'she', 'his', 'her', 'him', 'who', 'what', 'when', 'where', 'why', 'how', 'which', 'also', 'than', 'then', 'too', 'very', 'just', 'now', 'new', 'more', 'most', 'some', 'such', 'no', 'yes', 'yet', 'still', 'over', 'under', 'again', 'once'
    ];
    return query
      .replace(/[^\w\s-]/g, '')
      .split(/\s+/)
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 2 && !stopwords.includes(w));
  };
  const extractedKeywords = extractKeywords(searchQuery);

  // --- Web Search (SerpAPI) Handler ---
  const handleSerpSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setSerpError('Please enter a search term.');
      setSerpResults(null);
      return;
    }
    setIsLoading(true);
    setSerpError(null);
    setSerpResults(null);
    try {
      const res = await fetch(`/api/serp-search?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch search results: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Search response:', data); // Debug log
      
      if (data && data.success && data.results) {
        // Transform the backend response to match the frontend's expected format
        const organicResults = data.results.map((result: any) => ({
          title: result.title,
          link: result.reference || '#',
          displayed_link: `cve.mitre.org/cgi-bin/cvename.cgi?name=${result.id}`,
          snippet: result.description,
          // Include additional fields that might be used by the UI
          severity: result.severity,
          cvss: result.cvss,
          id: result.id
        }));
        
        setSerpResults({ organic_results: organicResults });
        setSerpError(null);
      } else {
        setSerpResults({ organic_results: [] });
        setSerpError(data.message || 'No results found.');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred while searching the web.';
      setSerpError(errorMsg);
      setSerpResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Main render logic ---
  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 text-white transition-all duration-300 ease-in-out`}>
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold">Threat Nexus</h1>
          ) : (
            <Shield className="w-8 h-8 mx-auto" />
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-full hover:bg-gray-700"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <nav className="mt-8">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex items-center w-full px-4 py-3 text-left ${
                item.active ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {isSidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-black shadow-sm">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="relative">
                <button
                  className="flex items-center space-x-2 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-md"
                  onClick={() => setShowUserSwitch((v) => !v)}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {currentUser?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  {isSidebarOpen && (
                    <div className="text-left">
                      <p className="text-sm font-medium">{currentUser?.username || 'User'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.role || ''}</p>
                    </div>
                  )}
                </button>
                {/* User switch dropdown */}
                {showUserSwitch && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4">
                    <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Switch User</div>
                    <input
                      type="text"
                      placeholder="Username"
                      className="w-full mb-2 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      value={switchUsername}
                      onChange={e => setSwitchUsername(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full mb-2 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      value={switchPassword}
                      onChange={e => setSwitchPassword(e.target.value)}
                    />
                    {switchError && <div className="text-red-500 text-xs mb-2">{switchError}</div>}
                    <div className="flex gap-2">
                      <button
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2 text-sm font-semibold"
                        onClick={async () => {
                          setSwitchError('');
                          const ok = await login(switchUsername, switchPassword);
                          if (!ok) setSwitchError('Invalid credentials');
                          else setShowUserSwitch(false);
                        }}
                      >Switch</button>
                      <button
                        className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded px-3 py-2 text-sm font-semibold"
                        onClick={() => setShowUserSwitch(false)}
                      >Cancel</button>
                      <button
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded px-3 py-2 text-sm font-semibold"
                        onClick={() => { logout(); setShowUserSwitch(false); }}
                      >Logout</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-black via-gray-900 to-gray-800">
          <div className="max-w-6xl mx-auto">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="flex space-x-1" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('search')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                    activeTab === 'search'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Search
                </button>
                <button
                  onClick={() => setActiveTab('map')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                    activeTab === 'map'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Threat Map
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                    activeTab === 'analytics'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab('serp')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                    activeTab === 'serp'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Web Search
                </button>
              </nav>
              {/* 7. Add a faint divider line below the main tabs */}
              <div className="h-0.5 bg-gradient-to-r from-blue-200/20 via-gray-400/10 to-blue-200/20 w-full mt-1 mb-2 rounded-full" />
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
              {(() => {
                switch (activeTab) {
                  case 'search':
                    return (
                      <>
                        <div className="text-center mb-8">
                          <div className="w-20 h-20 bg-blue-200 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Shield className="w-10 h-10 text-blue-700 dark:text-blue-300" />
                          </div>
                          {/* 2. Larger, more contrasted title */}
                          <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow-lg tracking-tight">
                            Threat Intelligence Explorer
                          </h1>
                          <p className="text-gray-300 text-lg">
                            Search and analyze potential security threats across multiple sources
                          </p>
                        </div>

                        {/* Search Bar */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 mb-4 relative">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              type="text"
                              placeholder="Search for IP, domain, CVE, hash, keyword, etc. (e.g. 8.8.8.8, CVE-2023-1234, sql injection)"
                              className="pl-10 pr-24 py-6 text-base bg-gray-100 text-black placeholder-gray-500 border-gray-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-md"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={handleKeyDown}
                            />
                            {/* 3. Info icon/tooltip for search help */}
                            <span className="absolute right-32 top-1/2 transform -translate-y-1/2 cursor-pointer group">
                              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" /></svg>
                              <span className="absolute left-8 top-1/2 -translate-y-1/2 bg-white text-gray-800 text-xs rounded shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                Supports IP, domain, CVE, hash, keyword, etc.
                              </span>
                            </span>
                            <Button
                              onClick={handleSearch}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-12 px-8 bg-blue-700 hover:bg-blue-800 text-lg font-semibold rounded-lg shadow-md flex items-center justify-center"
                              disabled={isLoading}
                            >
                              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                              {isLoading ? 'Searching...' : 'Search'}
                            </Button>
                          </div>
                          {/* Keyword Pane */}
                          {extractedKeywords.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {extractedKeywords.map((kw, idx) => (
                                <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-300">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Search Results */}
                        {searchResults && (
                          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 text-black">
                            <h2 className="text-lg font-semibold mb-4">Search Results</h2>
                            {searchResults.success && searchResults.data ? (
                              <div>
                                <div className="mb-2">
                                  <span className="font-bold">Query:</span> {searchResults.data.query}
                                </div>
                                <div className="mb-2">
                                  <span className="font-bold">Type:</span> {searchResults.data.type}
                                </div>
                                <div className="mb-2">
                                  <span className="font-bold">Sources:</span> {searchResults.data.sources.join(', ')}
                                </div>
                                <div className="mb-2">
                                  <span className="font-bold">Malicious:</span> {searchResults.data.malicious ? 'Yes' : 'No'}
                                </div>
                                <div className="mb-2">
                                  <span className="font-bold">Score:</span> {searchResults.data.score}
                                </div>
                                <div className="mb-2">
                                  <span className="font-bold">Tags:</span> {searchResults.data.tags.join(', ') || 'None'}
                                </div>
                                <div className="mb-2">
                                  <span className="font-bold">Details:</span>
                                  <pre className="bg-gray-100 text-green-700 p-2 rounded mt-1 overflow-x-auto text-xs max-h-64 whitespace-pre-wrap">
                                    {JSON.stringify(searchResults.data.details, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            ) : (
                              <div className="text-red-600">{searchResults.error || 'No results found.'}</div>
                            )}
                          </div>
                        )}

                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                          <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Searches</h2>
                            <div className="space-y-2">
                              {recentSearches.map((search) => (
                                <div
                                  key={search.id}
                                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md cursor-pointer"
                                  onClick={() => setSearchQuery(search.query)}
                                >
                                  <span className="text-blue-700 font-medium">{search.query}</span>
                                  <span className="text-sm text-gray-500">
                                    {new Date(search.timestamp).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  case 'map':
                    return (
                      <>
                        <div className="bg-black rounded-lg shadow-sm overflow-hidden">
                          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Global Threat Map</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Visual representation of threat activity across the globe
                            </p>
                          </div>
                          <div className="h-[600px] w-full">
                            <Suspense fallback={<MapLoading />}>
                              <div className="space-y-4">
                                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                  <h3 className="text-lg font-semibold mb-3 text-white">Threat Intelligence Lookup</h3>
                                  <div className="flex flex-col space-y-3">
                                    <div className="flex space-x-2">
                                      <Input
                                        type="text"
                                        placeholder="Enter IP address (e.g., 8.8.8.8)"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isRateLimited}
                                      />
                                      <Button 
                                        onClick={handleSearch}
                                        disabled={!searchQuery.trim() || isRateLimited}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                      >
                                        {isLoading ? (
                                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                          <Target className="h-4 w-4 mr-2" />
                                        )}
                                        Locate Threat
                                      </Button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                      <div className="flex items-center">
                                        <span className="inline-block w-2 h-2 rounded-full mr-1.5 bg-green-500"></span>
                                        <span>Rate Limit: {queryCount}/45 per minute</span>
                                      </div>
                                      {isRateLimited && (
                                        <div className="flex items-center text-amber-400">
                                          <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                          <span>Rate limit exceeded</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="border border-gray-700 rounded-lg overflow-hidden">
                                  <ThreatMap 
                                    ipAddress={mapIpAddress}
                                    onLocationFound={handleLocationFound}
                                    onClearAll={handleClearAll}
                                    threatCount={Object.keys(threatMarkers).length}
                                    onThreatCountChange={(count) => setThreatMarkers({})}
                                    onRateLimitChange={handleRateLimitChange}
                                    onQueryCountChange={handleQueryCountChange}
                                  />
                                </div>
                                
                                {ipLocationData && (
                                  <div className="bg-black p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-3">IP Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">IP Address:</span>
                                          <span className="font-mono">{ipLocationData.query}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Location:</span>
                                          <span>{[
                                            ipLocationData.city,
                                            ipLocationData.regionName,
                                            ipLocationData.country
                                          ].filter(Boolean).join(', ')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">ISP:</span>
                                          <span>{ipLocationData.isp}</span>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Organization:</span>
                                          <span>{ipLocationData.org || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Timezone:</span>
                                          <span>{typeof ipLocationData.timezone === 'string' ? ipLocationData.timezone : JSON.stringify(ipLocationData.timezone)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Coordinates:</span>
                                          <span className="font-mono">
                                            {ipLocationData.lat.toFixed(4)}, {ipLocationData.lon.toFixed(4)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Suspense>
                          </div>
                        </div>
                      </>
                    );
                  case 'analytics':
                    return <AnalyticsPage />;
                  case 'serp':
                    return (
                      <>
                        <div className="text-center mb-8">
                          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                          </div>
                          <h1 className="text-3xl font-bold text-gray-100 mb-2">
                            Threat Web Search
                          </h1>
                          <p className="text-gray-300">
                            Search the web for threat intelligence, news, and more
                          </p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                          <div className="relative">
                            <Input
                              type="text"
                              placeholder="Search Google (powered by SerpAPI)"
                              className="pl-10 pr-24 py-6 text-base bg-gray-100 text-black placeholder-gray-500 border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSerpSearch()}
                            />
                            <Button
                              onClick={handleSerpSearch}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-6 bg-blue-700 hover:bg-blue-800"
                              disabled={isLoading}
                            >
                              {isLoading ? 'Searching...' : 'Web Search'}
                            </Button>
                          </div>
                        </div>
                        {serpError && (
                          <div className="text-red-600 text-center mb-4">{serpError}</div>
                        )}
                        {serpResults && serpResults.organic_results && (
                          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 text-black">
                            <h2 className="text-lg font-semibold mb-4">Web Results</h2>
                            <ul className="space-y-6">
                              {serpResults.organic_results.map((result, idx) => (
                                <li key={idx} className="border-b border-gray-200 pb-4">
                                  <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline text-lg font-semibold">
                                    {result.title}
                                  </a>
                                  <div className="text-xs text-gray-500 mb-1">{result.displayed_link || result.link}</div>
                                  <div className="text-gray-800 text-sm">{result.snippet}</div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    );
                  default:
                    return null;
                }
              })()}
            </div>
          </div>
        </main>
      </div>

      {/* History Table */}
      {threats.length > 0 && (
        <div className="container mx-auto px-6 pb-8">
          <ThreatHistoryTable threats={threats} />
        </div>
      )}
    </div>
  );
};

// Component to display threat history in a table
const ThreatHistoryTable: React.FC<{ threats: ThreatData[] }> = ({ threats }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Value
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Risk
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              First Seen
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Last Seen
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {threats.map((threat) => (
            <tr key={threat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                {threat.type.toUpperCase()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {threat.value}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  threat.risk === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  threat.risk === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                  threat.risk === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {threat.risk.charAt(0).toUpperCase() + threat.risk.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {new Date(threat.firstSeen).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {new Date(threat.lastSeen).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ThreatIntelligenceExplorer;
