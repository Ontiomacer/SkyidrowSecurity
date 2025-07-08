
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Brain, 
  Search, 
  Upload, 
  Download, 
  RefreshCw, 
  Network, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface IOC {
  id: string;
  value: string;
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email';
  confidence: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  firstSeen: string;
  lastSeen: string;
  tags: string[];
  threatTypes: string[];
  reputation: number;
  correlations?: string[];
  aiInsights?: string;
}

interface CorrelationResult {
  iocId: string;
  relatedIocs: string[];
  relationshipType: string;
  confidence: number;
  explanation: string;
}

const IOCCorrelationEngine: React.FC = () => {
  const [iocs, setIocs] = useState<IOC[]>([]);
  const [selectedIoc, setSelectedIoc] = useState<IOC | null>(null);
  const [correlationResults, setCorrelationResults] = useState<CorrelationResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Sample IOC data with realistic cybersecurity indicators
  useEffect(() => {
    const sampleIOCs: IOC[] = [
      {
        id: 'IOC-001',
        value: '185.220.101.42',
        type: 'ip',
        confidence: 'critical',
        source: 'ThreatConnect',
        firstSeen: '2025-01-10T08:00:00Z',
        lastSeen: '2025-01-15T14:30:00Z',
        tags: ['TOR', 'C2', 'APT28', 'Backdoor'],
        threatTypes: ['Command and Control', 'Data Exfiltration'],
        reputation: 95,
        correlations: ['IOC-002', 'IOC-005'],
        aiInsights: 'High-confidence C2 server associated with APT28 campaign targeting financial institutions'
      },
      {
        id: 'IOC-002',
        value: 'malware-c2.darkweb.onion',
        type: 'domain',
        confidence: 'critical',
        source: 'DomainTools',
        firstSeen: '2025-01-08T12:15:00Z',
        lastSeen: '2025-01-15T16:45:00Z',
        tags: ['C2', 'Onion', 'APT28', 'Persistence'],
        threatTypes: ['Command and Control', 'Persistence'],
        reputation: 98,
        correlations: ['IOC-001', 'IOC-003'],
        aiInsights: 'TOR hidden service used for persistent C2 communication, likely operated by same threat actor'
      },
      {
        id: 'IOC-003',
        value: 'a1b2c3d4e5f6789012345678901234567890abcd',
        type: 'hash',
        confidence: 'high',
        source: 'VirusTotal',
        firstSeen: '2025-01-12T09:30:00Z',
        lastSeen: '2025-01-15T11:20:00Z',
        tags: ['Trojan', 'Backdoor', 'APT28', 'Persistence'],
        threatTypes: ['Malware', 'Backdoor'],
        reputation: 92,
        correlations: ['IOC-002', 'IOC-004'],
        aiInsights: 'Custom backdoor payload with similar code patterns to known APT28 toolkit'
      },
      {
        id: 'IOC-004',
        value: 'https://secure-update.legitimate-site.com/update.exe',
        type: 'url',
        confidence: 'high',
        source: 'URLVoid',
        firstSeen: '2025-01-11T15:45:00Z',
        lastSeen: '2025-01-14T10:15:00Z',
        tags: ['Dropper', 'Social Engineering', 'Masquerading'],
        threatTypes: ['Initial Access', 'Defense Evasion'],
        reputation: 88,
        correlations: ['IOC-003', 'IOC-006'],
        aiInsights: 'Typosquatted domain hosting malicious payload disguised as legitimate software update'
      },
      {
        id: 'IOC-005',
        value: 'support@security-team.company-name.com',
        type: 'email',
        confidence: 'medium',
        source: 'SpamTitan',
        firstSeen: '2025-01-13T11:00:00Z',
        lastSeen: '2025-01-15T09:30:00Z',
        tags: ['BEC', 'Social Engineering', 'Phishing'],
        threatTypes: ['Initial Access', 'Credential Access'],
        reputation: 76,
        correlations: ['IOC-001'],
        aiInsights: 'Business Email Compromise attempt using spoofed security team identity'
      },
      {
        id: 'IOC-006',
        value: 'legitmate-company.net',
        type: 'domain',
        confidence: 'medium',
        source: 'PhishTank',
        firstSeen: '2025-01-09T14:20:00Z',
        lastSeen: '2025-01-14T12:50:00Z',
        tags: ['Typosquatting', 'Phishing', 'Brand Impersonation'],
        threatTypes: ['Initial Access', 'Credential Harvesting'],
        reputation: 82,
        correlations: ['IOC-004'],
        aiInsights: 'Typosquatted domain mimicking legitimate company for credential harvesting'
      }
    ];
    
    setIocs(sampleIOCs);
  }, []);

  const runAICorrelation = async (targetIoc: IOC) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate AI analysis with progress updates
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    clearInterval(progressInterval);
    setAnalysisProgress(100);

    // Generate AI-powered correlation results
    const results: CorrelationResult[] = [];
    
    iocs.forEach(ioc => {
      if (ioc.id === targetIoc.id) return;
      
      // AI correlation logic based on multiple factors
      let confidence = 0;
      let relationshipType = '';
      let explanation = '';
      
      // Tag similarity correlation
      const sharedTags = targetIoc.tags.filter(tag => ioc.tags.includes(tag));
      if (sharedTags.length > 0) {
        confidence += sharedTags.length * 25;
        relationshipType = 'Tag Similarity';
        explanation = `Shares ${sharedTags.join(', ')} tags with target IOC`;
      }
      
      // Temporal proximity correlation
      const targetTime = new Date(targetIoc.firstSeen).getTime();
      const iocTime = new Date(ioc.firstSeen).getTime();
      const timeDiff = Math.abs(targetTime - iocTime) / (1000 * 60 * 60 * 24); // days
      
      if (timeDiff <= 7) {
        confidence += Math.max(0, 30 - (timeDiff * 4));
        relationshipType = relationshipType ? `${relationshipType}, Temporal` : 'Temporal Proximity';
        explanation += explanation ? ` and appeared within ${Math.ceil(timeDiff)} days` : `Appeared within ${Math.ceil(timeDiff)} days of target IOC`;
      }
      
      // Threat type correlation
      const sharedThreatTypes = targetIoc.threatTypes.filter(type => ioc.threatTypes.includes(type));
      if (sharedThreatTypes.length > 0) {
        confidence += sharedThreatTypes.length * 20;
        relationshipType = relationshipType ? `${relationshipType}, Threat Type` : 'Threat Type Similarity';
        explanation += explanation ? ` and shares ${sharedThreatTypes.join(', ')} threat types` : `Shares ${sharedThreatTypes.join(', ')} threat types`;
      }
      
      // Source correlation
      if (targetIoc.source === ioc.source) {
        confidence += 15;
        relationshipType = relationshipType ? `${relationshipType}, Source` : 'Same Source';
        explanation += explanation ? ` from same intelligence source` : `Reported by same intelligence source`;
      }
      
      if (confidence > 40) {
        results.push({
          iocId: ioc.id,
          relatedIocs: [targetIoc.id],
          relationshipType,
          confidence: Math.min(confidence, 100),
          explanation
        });
      }
    });
    
    setCorrelationResults(results.sort((a, b) => b.confidence - a.confidence));
    setIsAnalyzing(false);
    
    toast({
      title: "Nova AI: Correlation Analysis Complete",
      description: `Found ${results.length} related indicators with AI-powered analysis`,
    });
  };

  const filteredIocs = iocs.filter(ioc =>
    ioc.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ioc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCorrelationColor = (confidence: number) => {
    if (confidence >= 80) return 'text-red-500';
    if (confidence >= 60) return 'text-orange-500';
    if (confidence >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Header with AI Controls */}
      <Card className="bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Brain className="h-6 w-6 mr-3 text-blue-300" />
            Nova AI IOC Correlation Engine
            <Badge className="ml-3 bg-green-500 animate-pulse">AI-Powered</Badge>
          </CardTitle>
          <CardDescription className="text-blue-100">
            Advanced AI-powered correlation of indicators of compromise using machine learning algorithms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
              <Input 
                placeholder="Search IOCs by value, tag, or threat type..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Upload className="mr-2 h-4 w-4" />
              Upload IOCs
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Download className="mr-2 h-4 w-4" />
              Export Results
            </Button>
          </div>
          
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                  AI Correlation Analysis in Progress...
                </span>
                <span>{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">IOC Overview</TabsTrigger>
          <TabsTrigger value="correlations">AI Correlations</TabsTrigger>
          <TabsTrigger value="graph">Network Graph</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIocs.map((ioc) => (
              <Card 
                key={ioc.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${selectedIoc?.id === ioc.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedIoc(ioc)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getConfidenceColor(ioc.confidence)}>
                      {ioc.confidence.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">{ioc.type.toUpperCase()}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-mono text-sm break-all">{ioc.value}</p>
                    <div className="flex flex-wrap gap-1">
                      {ioc.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                      {ioc.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{ioc.tags.length - 3}</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(ioc.lastSeen).toLocaleDateString()}
                      </span>
                      <span>Rep: {ioc.reputation}%</span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        runAICorrelation(ioc);
                      }}
                      disabled={isAnalyzing}
                    >
                      <Brain className="mr-2 h-4 w-4" />
                      AI Correlate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-4">
          {correlationResults.length > 0 ? (
            <div className="space-y-4">
              {correlationResults.map((result, index) => {
                const relatedIoc = iocs.find(i => i.id === result.iocId);
                return (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Network className="h-4 w-4 text-blue-500" />
                          <span className="font-mono text-sm">{relatedIoc?.value}</span>
                          <Badge className={getConfidenceColor(relatedIoc?.confidence || 'low')}>
                            {relatedIoc?.confidence}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{result.explanation}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{result.relationshipType}</Badge>
                          <span className={`text-sm font-medium ${getCorrelationColor(result.confidence)}`}>
                            {result.confidence.toFixed(0)}% Confidence
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm">Investigate</Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Correlations Yet</h3>
              <p className="text-gray-600 mb-4">Select an IOC and click "AI Correlate" to discover relationships</p>
              <Button 
                onClick={() => selectedIoc && runAICorrelation(selectedIoc)}
                disabled={!selectedIoc || isAnalyzing}
              >
                <Brain className="mr-2 h-4 w-4" />
                Start AI Analysis
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="graph" className="space-y-4">
          <Card className="p-8 text-center">
            <Network className="h-16 w-16 mx-auto text-blue-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Interactive Network Graph</h3>
            <p className="text-gray-600 mb-4">Visual representation of IOC relationships and correlations</p>
            <Button>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Graph Visualization
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {selectedIoc ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-500" />
                  AI Insights for {selectedIoc.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Nova AI Analysis</h4>
                    <p className="text-blue-800">{selectedIoc.aiInsights}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-medium">Risk Assessment</h5>
                      <div className="flex items-center gap-2">
                        <Progress value={selectedIoc.reputation} className="flex-1" />
                        <span className="text-sm font-medium">{selectedIoc.reputation}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium">Threat Classification</h5>
                      <div className="flex flex-wrap gap-1">
                        {selectedIoc.threatTypes.map((type, i) => (
                          <Badge key={i} variant="outline">{type}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium">Recommended Actions</h5>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Block at network perimeter</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span>Monitor for related indicators</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <span>Run additional AI correlation analysis</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Select an IOC for AI Insights</h3>
              <p className="text-gray-600">Choose an indicator to see detailed AI-powered analysis and recommendations</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IOCCorrelationEngine;
