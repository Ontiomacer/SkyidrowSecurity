
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Search, Filter, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';

const iocData = [
  { 
    id: '1', 
    type: 'IP Address', 
    value: '185.147.36.42', 
    confidence: 'High', 
    source: 'VirusTotal', 
    lastSeen: '10 min ago',
    tags: ['C2', 'APT41'],
    detections: 5
  },
  { 
    id: '2', 
    type: 'Domain', 
    value: 'mal-delivery.net', 
    confidence: 'Critical', 
    source: 'MISP', 
    lastSeen: '15 min ago',
    tags: ['Phishing', 'Emotet'],
    detections: 12
  },
  { 
    id: '3', 
    type: 'Hash', 
    value: '9f4b53db3582b66c6b9c441d7195337e', 
    confidence: 'Medium', 
    source: 'AbuseIPDB', 
    lastSeen: '30 min ago',
    tags: ['Ransomware', 'BlackCat'],
    detections: 3
  },
  { 
    id: '4', 
    type: 'URL', 
    value: 'https://malicious-update.io/download.php', 
    confidence: 'High', 
    source: 'Internal', 
    lastSeen: '45 min ago',
    tags: ['Dropper', 'Credential Theft'],
    detections: 7
  },
  { 
    id: '5', 
    type: 'Email', 
    value: 'finance@legitimate-invoice.co', 
    confidence: 'Medium', 
    source: 'AlienVault', 
    lastSeen: '1 hour ago',
    tags: ['BEC', 'Social Engineering'],
    detections: 2
  },
];

const relatedIocs = [
  { 
    id: '101', 
    type: 'IP Address', 
    value: '185.147.36.43', 
    confidence: 'Medium', 
    relation: 'Same subnet as 185.147.36.42'
  },
  { 
    id: '102', 
    type: 'Domain', 
    value: 'secure-mal-delivery.net', 
    confidence: 'High', 
    relation: 'Related to mal-delivery.net'
  },
  { 
    id: '103', 
    type: 'URL', 
    value: 'https://mal-delivery.net/login.php', 
    confidence: 'Critical', 
    relation: 'Hosted on mal-delivery.net'
  },
];

const getConfidenceColor = (confidence: string) => {
  switch (confidence) {
    case 'Critical': return 'bg-red-500';
    case 'High': return 'bg-amber-500';
    case 'Medium': return 'bg-blue-500';
    case 'Low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

export const IOCCorrelation = () => {
  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>IOC Search & Correlation</CardTitle>
          <CardDescription>Search, correlate and enrich indicators of compromise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search for IOCs (IP, domain, hash, URL...)" className="pl-8" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Main IOC Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Indicators</CardTitle>
          <CardDescription>IOCs detected in your environment in the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Detections</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {iocData.map((ioc) => (
                <TableRow key={ioc.id}>
                  <TableCell>{ioc.type}</TableCell>
                  <TableCell className="font-mono">{ioc.value}</TableCell>
                  <TableCell>
                    <Badge className={`${getConfidenceColor(ioc.confidence)} text-white`}>
                      {ioc.confidence}
                    </Badge>
                  </TableCell>
                  <TableCell>{ioc.source}</TableCell>
                  <TableCell>{ioc.lastSeen}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {ioc.tags.map((tag, i) => (
                        <Badge key={i} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Badge variant="outline" className="bg-red-50">{ioc.detections}</Badge>
                      {ioc.detections > 5 && (
                        <AlertCircle className="ml-1 h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">Enrich</Button>
                      <Button size="sm" variant="outline">Analyze</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Related IOCs */}
      <Card>
        <CardHeader>
          <CardTitle>Related Indicators</CardTitle>
          <CardDescription>Automatically correlated IOCs based on selected indicator</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="font-medium">Selected Primary Indicator:</div>
            <div className="font-mono">mal-delivery.net (Domain)</div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatedIocs.map((ioc) => (
                <TableRow key={ioc.id}>
                  <TableCell>{ioc.type}</TableCell>
                  <TableCell className="font-mono">{ioc.value}</TableCell>
                  <TableCell>
                    <Badge className={`${getConfidenceColor(ioc.confidence)} text-white`}>
                      {ioc.confidence}
                    </Badge>
                  </TableCell>
                  <TableCell>{ioc.relation}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">View Details</Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" /> Lookup
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
