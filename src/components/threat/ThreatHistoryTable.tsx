
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Shield, AlertTriangle, Clock, Globe2, Building } from 'lucide-react';
import { ThreatData } from './ThreatIntelligenceExplorer';

interface ThreatHistoryTableProps {
  threats: ThreatData[];
}

const ThreatHistoryTable: React.FC<ThreatHistoryTableProps> = ({ threats }) => {
  const getThreatBadge = (level: string) => {
    switch (level) {
      case 'safe':
        return <Badge className="bg-green-600 text-white">SAFE</Badge>;
      case 'suspicious':
        return <Badge className="bg-yellow-600 text-white">SUSPICIOUS</Badge>;
      case 'malicious':
        return <Badge className="bg-red-600 text-white">MALICIOUS</Badge>;
      default:
        return <Badge className="bg-gray-600 text-white">UNKNOWN</Badge>;
    }
  };

  const getThreatIcon = (level: string) => {
    switch (level) {
      case 'safe':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'malicious':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Threat Intelligence History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {threats.map((threat) => (
            <div 
              key={threat.id}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                {/* IP and Threat Level */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getThreatIcon(threat.threatLevel)}
                    <span className="font-mono text-lg font-bold text-white">
                      {threat.ip}
                    </span>
                  </div>
                  {getThreatBadge(threat.threatLevel)}
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Globe2 className="h-4 w-4" />
                    <span className="font-medium">{threat.location.country}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {threat.location.city}, {threat.location.region}
                  </div>
                  <div className="text-xs text-gray-500">
                    {threat.location.timezone}
                  </div>
                </div>

                {/* ISP and Network */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Building className="h-4 w-4" />
                    <span className="font-medium text-sm">{threat.location.isp}</span>
                  </div>
                  {threat.virustotal && (
                    <div className="text-xs text-gray-400">
                      Network: {threat.virustotal.network}
                    </div>
                  )}
                </div>

                {/* VirusTotal Stats and Actions */}
                <div className="space-y-2">
                  {threat.virustotal ? (
                    <div className="space-y-1">
                      <div className="flex gap-2 text-xs">
                        <span className="text-red-400">
                          Malicious: {threat.virustotal.malicious}
                        </span>
                        <span className="text-yellow-400">
                          Suspicious: {threat.virustotal.suspicious}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Last scan: {threat.virustotal.lastAnalysis}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => window.open(threat.virustotal!.reportUrl, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Report
                      </Button>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">
                      VirusTotal data unavailable
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    {threat.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {threats.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No threat intelligence data yet.</p>
            <p className="text-sm">Search for IP addresses to start building your threat database.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ThreatHistoryTable;
