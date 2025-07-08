import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Globe, Server, Terminal, Copy, Download, FileText, Search, AlertCircle, FolderOpen } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import SatelliteMap from '@/components/ui/SatelliteMap';
import HttpsPanel from './components/HttpsPanel';
import type { NmapScanResult, OpenPort } from '@/types/nmap';


const ResultsPage: React.FC = () => {
  const { ip } = useParams<{ ip: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<NmapScanResult | null>(null);
  const [directories, setDirectories] = useState<string[]>([]);
  const [dirLoading, setDirLoading] = useState(false);
  const [dirError, setDirError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!ip) return;
    setLoading(true);
    setDirLoading(true);
    // Get wordlist from query param if present
    const params = new URLSearchParams(window.location.search);
    const wordlist = params.get('wordlist') || 'common.txt';
    // Fetch Nmap scan
    fetch(`/api/nmap-scan?ip=${encodeURIComponent(ip)}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'Scan failed.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setResult(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Scan failed.');
        setLoading(false);
      });
    // Fetch urlbuster directories with wordlist
    fetch(`/api/urlbuster?ip=${encodeURIComponent(ip)}&wordlist=${encodeURIComponent(wordlist)}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setDirError(data.error || 'Directory scan failed.');
          setDirLoading(false);
          return;
        }
        const data = await res.json();
        setDirectories(data.directories || []);
        setDirLoading(false);
      })
      .catch(() => {
        setDirError('Directory scan failed.');
        setDirLoading(false);
      });
  }, [ip]);

  return (
    <Layout>
      <main className="bg-slate-50 dark:bg-neutral-900 min-h-screen w-full font-sans">
        <section className="w-full max-w-2xl mx-auto pt-12 pb-4 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Scan Results for {ip}</h1>
          <Button variant="outline" className="mb-4" onClick={() => navigate('/simulations')}>New Scan</Button>
          {loading && <Loader2 className="animate-spin h-8 w-8 text-indigo-500 my-8" />}
          {error && (
            <div className="mt-4 flex items-center text-red-600 dark:text-red-400 text-sm font-bold">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
        </section>
        {result && (
          <section className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 px-2 md:px-4">
            {/* MAP PANEL */}
            <div className="md:col-span-5 col-span-1 flex flex-col gap-4">
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow border border-slate-200 dark:border-neutral-700 p-4 flex flex-col h-full min-h-[340px]">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-5 w-5 text-indigo-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Scan Map</span>
                </div>
                <div className="flex-1 min-h-[220px]">
                  <SatelliteMap
                    markers={(() => {
                      // Accept both lat/lng and latitude/longitude from backend
                      const info = result.ipinfo || {};
                      const lat = typeof info.lat === 'number' ? info.lat : (typeof info.latitude === 'number' ? info.latitude : undefined);
                      const lng = typeof info.lng === 'number' ? info.lng : (typeof info.longitude === 'number' ? info.longitude : undefined);
                      if (typeof lat === 'number' && typeof lng === 'number') {
                        return [{
                          ip: result.ip,
                          lat,
                          lng,
                          label: info.hostname || result.ip
                        }];
                      }
                      return [];
                    })()}
                  />
                </div>
                <div className="text-xs text-slate-400 mt-2">Hover a marker for IP, geo info, and threat score.</div>
              </div>
            </div>
            {/* RESULTS PANEL */}
            <div className="md:col-span-7 col-span-1 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* General Info Card */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow border border-slate-200 dark:border-neutral-700 p-6 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-neutral-700 pb-2">
                    <Server className="h-5 w-5 text-indigo-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">General Info</span>
                    <Button variant="ghost" size="icon" className="ml-auto" onClick={() => navigator.clipboard.writeText(result.ip)} title="Copy IP"><Copy className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <div><span className="text-slate-500">IP:</span> <span className="font-mono text-slate-800 dark:text-slate-100">{result.ip}</span></div>
                    <div><span className="text-slate-500">Hostname:</span> <span className="font-mono">{result.ipinfo?.hostname || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Org:</span> <span className="font-mono">{result.ipinfo?.org || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Country:</span> <span className="font-mono">{result.ipinfo?.country || 'N/A'}</span></div>
                    <div><span className="text-slate-500">City:</span> <span className="font-mono">{result.ipinfo?.city || 'N/A'}</span></div>
                    <div><span className="text-slate-500">ASN:</span> <span className="font-mono">{result.ipinfo?.asn || 'N/A'}</span></div>
                  </div>
                  <div className="text-xs text-slate-400 mt-2">Last scan: {new Date().toLocaleString()}</div>
                </div>
                {/* Open Ports Card */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow border border-slate-200 dark:border-neutral-700 p-6 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-neutral-700 pb-2">
                    <Terminal className="h-5 w-5 text-indigo-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Open Ports</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {result.openPorts && result.openPorts.length > 0 ? (
                      result.openPorts.map((p: OpenPort, i: number) => (
                        <span key={i} className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 px-2 py-1 rounded font-mono text-xs border border-indigo-200 dark:border-indigo-800" title={p.service}>{p.port}/{p.protocol}</span>
                      ))
                    ) : (
                      <span className="text-slate-400">No open ports</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">TCP/UDP ports detected by Nmap</div>
                </div>
                {/* HTTP Headers Card */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow border border-slate-200 dark:border-neutral-700 p-6 flex flex-col gap-2 col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-neutral-700 pb-2">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">HTTP Response / Headers</span>
                  </div>
                  <HttpsPanel />
                </div>
                {/* URLBuster Directories Card */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow border border-slate-200 dark:border-neutral-700 p-6 flex flex-col gap-2 col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-neutral-700 pb-2">
                    <FolderOpen className="h-5 w-5 text-indigo-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Discovered Directories</span>
                  </div>
                  {dirLoading ? (
                    <Loader2 className="animate-spin h-6 w-6 text-indigo-500 my-4" />
                  ) : dirError ? (
                    <div className="text-red-500 text-sm">{dirError}</div>
                  ) : directories.length === 0 ? (
                    <div className="text-slate-400 text-sm">No directories found.</div>
                  ) : (
                    <ul className="list-disc pl-6 text-sm">
                      {directories.map((dir, idx) => (
                        <li key={idx} className="text-indigo-700 dark:text-indigo-300 font-mono break-all">{dir}</li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* Raw Output Card */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow border border-slate-200 dark:border-neutral-700 p-6 flex flex-col gap-2 col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-neutral-700 pb-2">
                    <Terminal className="h-5 w-5 text-indigo-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Raw Nmap Output</span>
                    <Button variant="ghost" size="icon" className="ml-auto" onClick={() => {}} title="Expand/Collapse"><Copy className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (result.raw) navigator.clipboard.writeText(result.raw); }} title="Copy Raw"><Copy className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (result.raw) { const blob = new Blob([result.raw], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${result.ip}-nmap.txt`; a.click(); URL.revokeObjectURL(url); } }} title="Download"><Download className="h-4 w-4" /></Button>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-neutral-900 rounded text-xs font-mono overflow-x-auto border border-slate-200 dark:border-neutral-800">
                    <pre><code style={{ color: '#000' }}>{typeof result.raw === 'string' && result.raw.trim() !== '' ? result.raw : 'No raw output available.'}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
};

export default ResultsPage;
