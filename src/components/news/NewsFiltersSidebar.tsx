import React from 'react';

interface NewsFiltersSidebarProps {
  dateFrom: string;
  dateTo: string;
  onDateFrom: (v: string) => void;
  onDateTo: (v: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  sources: string[];
  setSources: (sources: string[]) => void;
  severity: ("Critical" | "High" | "Moderate" | "Low")[];
  setSeverity: (sev: ("Critical" | "High" | "Moderate" | "Low")[]) => void;
  onlyWithIOCs: boolean;
  setOnlyWithIOCs: (v: boolean) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const ALL_TAGS = ['Malware', 'Ransomware', 'Zero-day', 'APT'];
const ALL_SOURCES = ['Guardian', 'CyberNews', 'BleepingComputer', 'HackerNews', 'KrebsOnSecurity', 'MITRE ATT&CK', 'NVD'];
const ALL_SEVERITY: ("Critical" | "High" | "Moderate" | "Low")[] = ['Critical', 'High', 'Moderate', 'Low'];

export const NewsFiltersSidebar: React.FC<NewsFiltersSidebarProps> = ({
  dateFrom, dateTo, onDateFrom, onDateTo, tags, setTags, sources, setSources, severity, setSeverity, onlyWithIOCs, setOnlyWithIOCs, collapsed, setCollapsed
}) => (
  <aside className={`transition-all duration-300 bg-gray-900/95 border-r border-blue-900/40 h-full p-4 flex flex-col gap-6 shadow-xl z-30 ${collapsed ? 'w-12' : 'w-64'}`} style={{ minHeight: '80vh' }}>
    <button className="self-end mb-2 text-blue-400 hover:text-blue-200" onClick={() => setCollapsed(!collapsed)} title="Toggle filters">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5" /></svg>
    </button>
    {!collapsed && <>
      <div>
        <label className="block text-xs text-blue-200 mb-1">Date Range</label>
        <div className="flex gap-2">
          <input type="date" value={dateFrom} onChange={e => onDateFrom(e.target.value)} className="bg-gray-800 text-white rounded px-2 py-1 text-xs border border-blue-900/30" />
          <input type="date" value={dateTo} onChange={e => onDateTo(e.target.value)} className="bg-gray-800 text-white rounded px-2 py-1 text-xs border border-blue-900/30" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-blue-200 mb-1">Tags</label>
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map(tag => (
            <button key={tag} className={`px-2 py-1 rounded text-xs border ${tags.includes(tag) ? 'bg-blue-700 text-white border-blue-400' : 'bg-gray-800 text-blue-200 border-blue-900/30'}`} onClick={() => setTags(tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag])}>{tag}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs text-blue-200 mb-1">Source</label>
        <div className="flex flex-wrap gap-2">
          {ALL_SOURCES.map(src => (
            <button key={src} className={`px-2 py-1 rounded text-xs border ${sources.includes(src) ? 'bg-blue-700 text-white border-blue-400' : 'bg-gray-800 text-blue-200 border-blue-900/30'}`} onClick={() => setSources(sources.includes(src) ? sources.filter(s => s !== src) : [...sources, src])}>{src}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs text-blue-200 mb-1">Severity</label>
        <div className="flex flex-wrap gap-2">
          {ALL_SEVERITY.map(sev => (
            <button key={sev} className={`px-2 py-1 rounded text-xs border ${severity.includes(sev) ? 'bg-blue-700 text-white border-blue-400' : 'bg-gray-800 text-blue-200 border-blue-900/30'}`} onClick={() => setSeverity(severity.includes(sev) ? severity.filter(s => s !== sev) : [...severity, sev])}>{sev}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 text-xs text-blue-200">
          <input type="checkbox" checked={onlyWithIOCs} onChange={e => setOnlyWithIOCs(e.target.checked)} />
          Only show articles with CVEs/IOCs
        </label>
      </div>
    </>}
  </aside>
);
