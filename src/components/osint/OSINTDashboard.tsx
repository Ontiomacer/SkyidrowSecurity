
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Search, Globe, Database, Eye, AlertTriangle, ExternalLink, Download, FileText, FileSpreadsheet, BarChart3, Clock, CheckCircle, XCircle } from 'lucide-react';
import { osintService } from '@/services/OSINTService';
import { DownloadService } from '@/services/DownloadService';
import { usageTrackingService } from '@/services/UsageTrackingService';
import { toast } from '@/components/ui/use-toast';

// Move ResultDisplay above QueryCard to fix ReferenceError
// Define types for better type safety
type OsintTool = 'virustotal' | 'abusedb' | 'shodan' | 'whois' | 'urlscan' | 'google-dork';

interface OsintResult {
  error?: string;
  suggestion?: string;
  workaround?: string;
  service?: string;
  [key: string]: any;
}

interface ResultDisplayProps {
  result: OsintResult;
  tool: OsintTool;
  onDownload: (tool: OsintTool, format: 'json' | 'csv' | 'txt') => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, tool, onDownload }) => {
  if (result.error) {
    return (
      <Alert className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Error:</strong> {result.error}
          {result.suggestion && (
            <div className="mt-2">
              <strong>Solution:</strong> {result.suggestion}
            </div>
          )}
          {result.workaround && (
            <div className="mt-2">
              <strong>Workaround:</strong> 
              <a 
                href={result.workaround} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 text-blue-600 hover:underline inline-flex items-center"
              >
                Visit {result.service} manually <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Download Options */}
      <div className="flex gap-2 p-2 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-600">Download:</span>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onDownload(tool, 'json')}
          className="h-6 px-2 text-xs"
        >
          <Download className="h-3 w-3 mr-1" />
          JSON
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onDownload(tool, 'csv')}
          className="h-6 px-2 text-xs"
        >
          <FileSpreadsheet className="h-3 w-3 mr-1" />
          CSV
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onDownload(tool, 'txt')}
          className="h-6 px-2 text-xs"
        >
          <FileText className="h-3 w-3 mr-1" />
          TXT
        </Button>
      </div>

      {/* Results Display */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Results:</h4>
        <pre className="text-xs overflow-auto max-h-40 whitespace-pre-wrap">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </div>
  );
};

interface QueryCardProps {
  title: string;
  icon: React.ReactNode;
  tool: OsintTool;
  description: string;
  placeholder: string;
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onQuery: () => void;
  result: OsintResult | undefined;
  onDownload: (tool: OsintTool, format: 'json' | 'csv' | 'txt') => void;
}

const QueryCard: React.FC<QueryCardProps> = React.memo(({ title, icon, tool, description, placeholder, value, loading, onChange, onQuery, result, onDownload }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {icon}
        {title}
      </CardTitle>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') onQuery();
          }}
          disabled={loading}
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          pattern={undefined}
          maxLength={4096}
        />
        <Button
          onClick={onQuery}
          disabled={loading || !value?.trim()}
        >
          {loading ? 'Querying...' : 'Analyze'}
        </Button>
      </div>
      {result && <ResultDisplay result={result} tool={tool} onDownload={onDownload} />}
    </CardContent>
  </Card>
));

const OSINTDashboard: React.FC = () => {
  const [queries, setQueries] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string>('');
const [results, setResults] = useState<Record<OsintTool, OsintResult | undefined>>({} as Record<OsintTool, OsintResult>);
  const [analytics, setAnalytics] = useState({
    totalQueries: 0,
    successfulQueries: 0,
    failedQueries: 0,
    rateLimitsHit: 0,
    successRate: 0,
    toolUsage: {} as Record<string, number>
  });

  // Load usage data on component mount
  useEffect(() => {
    usageTrackingService.loadFromStorage();
    updateAnalytics();
  }, []);

  const updateAnalytics = () => {
    const userId = 'anonymous'; // In a real app, this would come from auth context
    const userStats = usageTrackingService.getUserStats(userId);
    const userQueries = usageTrackingService.getUserQueries(userId, 1000);
    
    const totalQueries = userQueries.length;
    const successfulQueries = userQueries.filter(q => q.success).length;
    const failedQueries = totalQueries - successfulQueries;
    const rateLimitsHit = userQueries.filter(q => q.errorMessage?.includes('rate limit')).length;
    const successRate = totalQueries > 0 ? (successfulQueries / totalQueries) * 100 : 0;
    
    // Calculate tool usage
    const toolUsage: Record<string, number> = {};
    userQueries.forEach(query => {
      toolUsage[query.tool] = (toolUsage[query.tool] || 0) + 1;
    });

    setAnalytics({
      totalQueries,
      successfulQueries,
      failedQueries,
      rateLimitsHit,
      successRate,
      toolUsage
    });
  };

  const handleInputChange = (tool: string, value: string) => {
    setQueries(prev => ({
      ...prev,
      [tool]: value
    }));
  };

  const handleQuery = async (tool: string) => {
    const query = queries[tool];
    
    if (!query || !query.trim()) {
      toast({
        title: "Invalid Query",
        description: "Please enter a valid target to analyze.",
        variant: "destructive"
      });
      return;
    }

    setLoading(tool);
    const startTime = Date.now();

    try {
      let result;
      
      switch (tool) {
        case 'virustotal':
          result = await osintService.queryVirusTotal(query.trim());
          break;
        case 'abusedb':
          result = await osintService.queryAbuseDB(query.trim());
          break;
        case 'shodan':
          result = await osintService.queryShodan(query.trim());
          break;
        case 'whois':
          result = await osintService.queryWHOIS(query.trim());
          break;
        case 'urlscan':
          result = await osintService.queryURLScan(query.trim());
          break;
        case 'google-dork':
          result = await osintService.performGoogleDorking(query.trim());
          break;
        default:
          throw new Error('Unknown tool');
      }

      const responseTime = Date.now() - startTime;
      const success = !result.error;

      // Log the query for analytics
      usageTrackingService.logQuery({
        id: Date.now().toString(),
        userId: 'anonymous', // In a real app, this would come from auth context
        tool: tool as any,
        query: query.trim(),
        timestamp: new Date(),
        success,
        responseTime,
        errorMessage: result.error || undefined
      });

      setResults(prev => ({
        ...prev,
        [tool]: result
      }));

      // Update analytics after logging the query
      updateAnalytics();

      if (result.error) {
        toast({
          title: "API Limitation",
          description: result.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Query Successful",
          description: `${tool} analysis completed for ${query}`,
        });
      }

    } catch (error) {
      console.error(`Error querying ${tool}:`, error);
      
      const responseTime = Date.now() - startTime;
      
      // Log the failed query for analytics
      usageTrackingService.logQuery({
        id: Date.now().toString(),
        userId: 'anonymous',
        tool: tool as any,
        query: query.trim(),
        timestamp: new Date(),
        success: false,
        responseTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      // Update analytics after logging the failed query
      updateAnalytics();
      
      let errorMessage = `Failed to analyze ${query} with ${tool}`;
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      toast({
        title: "Query Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading('');
    }
  };

  const handleDownload = (tool: OsintTool, format: 'json' | 'csv' | 'txt') => {
    const result = results[tool];
    const query = queries[tool];
    if (!result) {
      toast({
        title: "No Data",
        description: "No results to download. Please run a query first.",
        variant: "destructive"
      });
      return;
    }
    const filename = DownloadService.generateFilename(tool, query);
    try {
      switch (format) {
        case 'json':
          DownloadService.downloadJSON(result, filename);
          break;
        case 'csv':
          DownloadService.downloadCSV(result, filename);
          break;
        case 'txt':
          DownloadService.downloadTXT(result, filename);
          break;
      }
      toast({
        title: "Download Started",
        description: `${tool} results downloaded as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download results. Please try again.",
        variant: "destructive"
      });
    }
  };

  const ResultDisplay: React.FC<{ result: any; tool: string }> = ({ result, tool }) => {
    if (result.error) {
      return (
        <Alert className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {result.error}
            {result.suggestion && (
              <div className="mt-2">
                <strong>Solution:</strong> {result.suggestion}
              </div>
            )}
            {result.workaround && (
              <div className="mt-2">
                <strong>Workaround:</strong> 
                <a 
                  href={result.workaround} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 text-blue-600 hover:underline inline-flex items-center"
                >
                  Visit {result.service} manually <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="mt-4 space-y-4">
        {/* Download Options */}
        <div className="flex gap-2 p-2 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-600">Download:</span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleDownload(tool, 'json')}
            className="h-6 px-2 text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            JSON
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleDownload(tool, 'csv')}
            className="h-6 px-2 text-xs"
          >
            <FileSpreadsheet className="h-3 w-3 mr-1" />
            CSV
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleDownload(tool, 'txt')}
            className="h-6 px-2 text-xs"
          >
            <FileText className="h-3 w-3 mr-1" />
            TXT
          </Button>
        </div>

        {/* Results Display */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Results:</h4>
          <pre className="text-xs overflow-auto max-h-40 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  // ...existing code...

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">OSINT Intelligence Platform</h1>
        <Badge variant="outline">Live APIs</Badge>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> Most OSINT APIs have CORS restrictions that prevent direct browser access. 
          For production use, these APIs should be called from a backend server. Results may show CORS errors 
          with workarounds provided.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="tools" className="w-full">
        <TabsList>
          <TabsTrigger value="tools">OSINT Tools</TabsTrigger>
          <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QueryCard
              key="virustotal"
              title="VirusTotal"
              icon={<Shield className="h-5 w-5 text-red-500" />}
              tool="virustotal"
              description="Scan IPs, domains, URLs, and file hashes for malware"
              placeholder="Enter IP, domain, URL, or hash"
              value={queries['virustotal'] || ''}
              loading={loading === 'virustotal'}
              onChange={v => handleInputChange('virustotal', v)}
              onQuery={() => handleQuery('virustotal')}
              result={results['virustotal']}
              onDownload={handleDownload}
            />
            <QueryCard
              key="abusedb"
              title="AbuseIPDB"
              icon={<Database className="h-5 w-5 text-orange-500" />}
              tool="abusedb"
              description="Check IP addresses for malicious activity reports"
              placeholder="Enter IP address"
              value={queries['abusedb'] || ''}
              loading={loading === 'abusedb'}
              onChange={v => handleInputChange('abusedb', v)}
              onQuery={() => handleQuery('abusedb')}
              result={results['abusedb']}
              onDownload={handleDownload}
            />
            <QueryCard
              key="shodan"
              title="Shodan"
              icon={<Search className="h-5 w-5 text-blue-500" />}
              tool="shodan"
              description="Discover internet-connected devices and services"
              placeholder="Enter IP address"
              value={queries['shodan'] || ''}
              loading={loading === 'shodan'}
              onChange={v => handleInputChange('shodan', v)}
              onQuery={() => handleQuery('shodan')}
              result={results['shodan']}
              onDownload={handleDownload}
            />
            <QueryCard
              key="whois"
              title="WHOIS Lookup"
              icon={<Globe className="h-5 w-5 text-green-500" />}
              tool="whois"
              description="Get domain registration and ownership information"
              placeholder="Enter domain name"
              value={queries['whois'] || ''}
              loading={loading === 'whois'}
              onChange={v => handleInputChange('whois', v)}
              onQuery={() => handleQuery('whois')}
              result={results['whois']}
              onDownload={handleDownload}
            />
            <QueryCard
              key="urlscan"
              title="URLScan.io"
              icon={<Eye className="h-5 w-5 text-purple-500" />}
              tool="urlscan"
              description="Analyze website behavior and security"
              placeholder="Enter URL to scan"
              value={queries['urlscan'] || ''}
              loading={loading === 'urlscan'}
              onChange={v => handleInputChange('urlscan', v)}
              onQuery={() => handleQuery('urlscan')}
              result={results['urlscan']}
              onDownload={handleDownload}
            />
            <QueryCard
              key="google-dork"
              title="Google Dorking"
              icon={<Search className="h-5 w-5 text-indigo-500" />}
              tool="google-dork"
              description="Perform advanced Google searches to find exposed information"
              placeholder="Enter Google dork query (e.g., site:example.com filetype:pdf)"
              value={queries['google-dork'] || ''}
              loading={loading === 'google-dork'}
              onChange={v => handleInputChange('google-dork', v)}
              onQuery={() => handleQuery('google-dork')}
              result={results['google-dork']}
              onDownload={handleDownload}
            />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                OSINT Usage Analytics
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track your OSINT tool usage and performance metrics
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    <h3 className="font-medium text-sm text-muted-foreground">Total Queries</h3>
                  </div>
                  <p className="text-2xl font-bold">{analytics.totalQueries}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <h3 className="font-medium text-sm text-muted-foreground">Success Rate</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{analytics.successRate.toFixed(1)}%</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <h3 className="font-medium text-sm text-muted-foreground">Failed Queries</h3>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{analytics.failedQueries}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <h3 className="font-medium text-sm text-muted-foreground">Rate Limits Hit</h3>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{analytics.rateLimitsHit}</p>
                </div>
              </div>

              {/* Tool Usage Breakdown */}
              {Object.keys(analytics.toolUsage).length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Tool Usage Breakdown</h4>
                  <div className="space-y-2">
                    {Object.entries(analytics.toolUsage).map(([tool, count]) => (
                      <div key={tool} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {tool === 'virustotal' && <Shield className="h-4 w-4 text-red-500" />}
                          {tool === 'abusedb' && <Database className="h-4 w-4 text-orange-500" />}
                          {tool === 'shodan' && <Search className="h-4 w-4 text-blue-500" />}
                          {tool === 'whois' && <Globe className="h-4 w-4 text-green-500" />}
                          {tool === 'urlscan' && <Eye className="h-4 w-4 text-purple-500" />}
                          {tool === 'google-dork' && <Search className="h-4 w-4 text-indigo-500" />}
                          <span className="font-medium capitalize">{tool.replace('-', ' ')}</span>
                        </div>
                        <Badge variant="outline">{count} queries</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analytics.totalQueries === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No OSINT queries performed yet.</p>
                  <p className="text-sm">Start analyzing targets to see your usage statistics.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OSINTDashboard;
