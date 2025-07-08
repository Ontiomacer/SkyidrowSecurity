
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CopyIcon, CheckIcon, PlayIcon, BookmarkIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface SPLQuery {
  title: string;
  description: string;
  query: string;
  category: string;
  complexity: 'Basic' | 'Intermediate' | 'Advanced';
  tags: string[];
}

export const SPLExamples = () => {
  const [activeTab, setActiveTab] = useState('security');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const splQueries: SPLQuery[] = [
    {
      title: "Failed Authentication Events",
      description: "Detects failed login attempts across all systems",
      query: `index=security sourcetype=*auth* OR sourcetype=*login* 
| where like(lower(event_message), "%fail%") OR like(lower(event_message), "%invalid%") 
| stats count by src_ip, user, host 
| sort -count`,
      category: "security",
      complexity: "Basic",
      tags: ["authentication", "security", "failed-login"]
    },
    {
      title: "Brute Force Detection",
      description: "Identifies potential brute force attacks by counting failed logins",
      query: `index=security sourcetype=*auth* 
| where action="failure" OR status="failed" 
| stats count as failures by src_ip, user, dest 
| where failures > 5 
| sort -failures 
| rename failures as "Failed Attempts"`,
      category: "security",
      complexity: "Intermediate",
      tags: ["brute-force", "authentication"]
    },
    {
      title: "Network Port Scanning Detection",
      description: "Detects potential port scanning activity",
      query: `index=network sourcetype=firewall* 
| stats dc(dest_port) as ports_accessed by src_ip, dest_ip 
| where ports_accessed > 15 
| sort -ports_accessed 
| rename ports_accessed as "Ports Scanned"`,
      category: "security",
      complexity: "Intermediate",
      tags: ["network", "port-scan", "reconnaissance"]
    },
    {
      title: "Unusual Process Execution",
      description: "Identifies suspicious process executions on endpoints",
      query: `index=endpoint sourcetype=windows:process OR sourcetype=linux:process 
| rare process_name, process_path limit=20 
| table _time, host, user, process_name, process_path, parent_process 
| sort -_time`,
      category: "security",
      complexity: "Advanced",
      tags: ["process", "endpoint", "suspicious"]
    },
    {
      title: "System Performance Overview",
      description: "Provides a summary of system performance metrics",
      query: `index=os sourcetype=cpu OR sourcetype=memory OR sourcetype=disk 
| stats avg(cpu_percent) as avg_cpu, avg(memory_used_percent) as avg_memory, 
  avg(disk_used_percent) as avg_disk by host 
| sort -avg_cpu`,
      category: "performance",
      complexity: "Basic",
      tags: ["performance", "monitoring", "system"]
    },
    {
      title: "HTTP Status Code Analysis",
      description: "Analyzes HTTP status codes from web servers",
      query: `index=web sourcetype=access_combined 
| stats count by status 
| eval status_category=case(
    status>=200 AND status<300, "Success", 
    status>=300 AND status<400, "Redirect", 
    status>=400 AND status<500, "Client Error", 
    status>=500, "Server Error") 
| stats sum(count) as requests by status_category 
| sort -requests`,
      category: "performance",
      complexity: "Basic",
      tags: ["web", "http", "status"]
    },
    {
      title: "Slow Database Queries",
      description: "Identifies slow-running database queries",
      query: `index=database sourcetype=*db*log* 
| where query_time > 1 
| sort -query_time 
| table _time, host, database_name, user, query_text, query_time 
| rename query_time as "Execution Time (sec)"`,
      category: "performance",
      complexity: "Intermediate",
      tags: ["database", "performance", "query"]
    },
    {
      title: "PCI DSS Failed Compliance Checks",
      description: "Reports on failed PCI DSS compliance checks",
      query: `index=compliance sourcetype=pci_scan 
| where status="failed" 
| stats count as failures by requirement, host 
| sort -failures 
| rename failures as "Failed Checks"`,
      category: "compliance",
      complexity: "Basic",
      tags: ["compliance", "pci", "audit"]
    },
    {
      title: "File Integrity Monitoring",
      description: "Tracks changes to critical system files",
      query: `index=security sourcetype=fim 
| where action="modified" OR action="created" OR action="deleted" 
| where match(file_path, "(?i)/etc/|/bin/|/sbin/|C:\\\\Windows\\\\System32") 
| table _time, host, user, action, file_path, file_hash 
| sort -_time`,
      category: "compliance",
      complexity: "Intermediate",
      tags: ["fim", "file-changes", "integrity"]
    },
    {
      title: "User Account Audit",
      description: "Comprehensive audit of user account activities",
      query: `index=security (sourcetype=wineventlog:security OR sourcetype=unix:auth) 
| transaction user maxspan=1h 
| stats count(eval(action="user created")) as created, 
        count(eval(action="user modified")) as modified, 
        count(eval(action="user deleted")) as deleted, 
        count(eval(action="password reset")) as pwd_reset 
        by user 
| where created>0 OR deleted>0 OR modified>0 OR pwd_reset>0`,
      category: "compliance",
      complexity: "Advanced",
      tags: ["users", "audit", "account-management"]
    }
  ];

  const copyToClipboard = (query: string, title: string) => {
    navigator.clipboard.writeText(query);
    setCopiedId(title);
    toast({
      title: "Query copied to clipboard",
      description: `The "${title}" query has been copied to your clipboard.`
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const runQuery = (query: string, title: string) => {
    // In a real Splunk app, this would execute the query in Splunk
    toast({
      title: "Query executed",
      description: `Running "${title}" in Splunk...`
    });
    console.log(`Executing query: ${query}`);
  };

  const saveQuery = (query: string, title: string) => {
    // In a real Splunk app, this would save the query to user's favorites
    toast({
      title: "Query saved",
      description: `"${title}" has been added to your saved queries.`
    });
  };

  const filteredQueries = splQueries.filter(query => query.category === activeTab);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SPL Examples</CardTitle>
          <CardDescription>
            Ready-to-use Splunk Processing Language queries for common security, performance, and compliance use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              {filteredQueries.map((query, index) => (
                <Card key={index} className="overflow-hidden border-l-4" 
                  style={{ borderLeftColor: 
                    query.complexity === 'Basic' ? '#22c55e' : 
                    query.complexity === 'Intermediate' ? '#f59e0b' : 
                    '#ef4444' 
                  }}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-md">{query.title}</CardTitle>
                        <CardDescription>{query.description}</CardDescription>
                      </div>
                      <Badge variant={
                        query.complexity === 'Basic' ? 'outline' : 
                        query.complexity === 'Intermediate' ? 'secondary' : 
                        'destructive'
                      }>
                        {query.complexity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="relative">
                      <ScrollArea className="h-[100px] w-full rounded-md border p-4 font-mono text-sm bg-gray-900 text-gray-100">
                        {query.query}
                      </ScrollArea>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full bg-gray-800 hover:bg-gray-700"
                          onClick={() => copyToClipboard(query.query, query.title)}
                        >
                          {copiedId === query.title ? (
                            <CheckIcon className="h-4 w-4 text-green-400" />
                          ) : (
                            <CopyIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1">
                      {query.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => saveQuery(query.query, query.title)}
                      >
                        <BookmarkIcon className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => runQuery(query.query, query.title)}
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Run
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
