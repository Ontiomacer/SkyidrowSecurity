import React from "react";
import Layout from "@/components/layout/Layout";
// Import your scan history data source (adjust path as needed)
// import { scanHistory } from "@/lib/threatIntelligence/scanHistory";

// Placeholder scan data (replace with real data source)
const scanHistory = [
  {
    id: 1,
    query: "8.8.8.8",
    type: "IP",
    provider: "AbuseIPDB",
    result: "Clean",
    timestamp: "2025-06-26 10:00:00",
  },
  {
    id: 2,
    query: "next.js cve 2025-29927",
    type: "CVE",
    provider: "NVD",
    result: "Critical CVE found",
    timestamp: "2025-06-26 10:05:00",
  },
  // ...more records
];

const AnalyticsPage: React.FC = () => {
  return (
    <Layout>
      <div className="bg-black min-h-screen text-white p-8">
        <h1 className="text-3xl font-bold mb-6">Threat Intelligence Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 shadow">
            <div className="text-2xl font-semibold">{scanHistory.length}</div>
            <div className="text-gray-400">Total Scans</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 shadow">
            <div className="text-2xl font-semibold">{scanHistory.filter(s => s.type === 'CVE').length}</div>
            <div className="text-gray-400">CVE Searches</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 shadow">
            <div className="text-2xl font-semibold">{scanHistory.filter(s => s.result.toLowerCase().includes('critical')).length}</div>
            <div className="text-gray-400">Critical Findings</div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg shadow p-6 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Scan History</h2>
          <table className="min-w-full text-left">
            <thead>
              <tr>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Query</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Provider</th>
                <th className="px-4 py-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {scanHistory.map((scan) => (
                <tr key={scan.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                  <td className="px-4 py-2 whitespace-nowrap">{scan.timestamp}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{scan.query}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{scan.type}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{scan.provider}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{scan.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
