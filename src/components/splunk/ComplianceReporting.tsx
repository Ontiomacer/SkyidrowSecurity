import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Download, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  BarChart,
  PieChart
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

const frameworkData = [
  { 
    id: '1', 
    name: 'NIST Cybersecurity Framework', 
    status: 'Compliant', 
    lastAssessment: '2 weeks ago',
    coverage: 92
  },
  { 
    id: '2', 
    name: 'PCI DSS', 
    status: 'Attention Required', 
    lastAssessment: '1 month ago',
    coverage: 78
  },
  { 
    id: '3', 
    name: 'HIPAA Security Rule', 
    status: 'Compliant', 
    lastAssessment: '3 weeks ago',
    coverage: 95
  },
  { 
    id: '4', 
    name: 'SOC 2', 
    status: 'Non-Compliant', 
    lastAssessment: '2 months ago',
    coverage: 65
  },
  { 
    id: '5', 
    name: 'ISO 27001', 
    status: 'Compliant', 
    lastAssessment: '1 week ago',
    coverage: 87
  }
];

const scheduledReportsData = [
  { 
    id: '1', 
    name: 'Weekly Security Posture Report', 
    frequency: 'Weekly', 
    nextRun: 'Tomorrow, 08:00 AM',
    recipients: 'Security Team, IT Management'
  },
  { 
    id: '2', 
    name: 'Monthly Compliance Summary', 
    frequency: 'Monthly', 
    nextRun: 'June 1, 2025, 06:00 AM',
    recipients: 'Compliance Officer, CISO'
  },
  { 
    id: '3', 
    name: 'Daily IOC Detection Report', 
    frequency: 'Daily', 
    nextRun: 'Today, 05:00 PM',
    recipients: 'SOC Team, Threat Analysts'
  },
  { 
    id: '4', 
    name: 'Quarterly Executive Brief', 
    frequency: 'Quarterly', 
    nextRun: 'July 1, 2025, 09:00 AM',
    recipients: 'Executive Team, Board'
  }
];

const reportHistoryData = [
  { 
    id: '1', 
    name: 'Weekly Security Posture Report', 
    generatedOn: 'May 7, 2025, 08:01 AM',
    status: 'Complete',
    size: '2.4 MB'
  },
  { 
    id: '2', 
    name: 'Weekly Security Posture Report', 
    generatedOn: 'Apr 30, 2025, 08:00 AM',
    status: 'Complete',
    size: '2.1 MB'
  },
  { 
    id: '3', 
    name: 'Monthly Compliance Summary', 
    generatedOn: 'May 1, 2025, 06:02 AM',
    status: 'Complete',
    size: '5.7 MB'
  },
  { 
    id: '4', 
    name: 'Monthly Compliance Summary', 
    generatedOn: 'Apr 1, 2025, 06:00 AM',
    status: 'Complete',
    size: '5.2 MB'
  },
  { 
    id: '5', 
    name: 'Quarterly Executive Brief', 
    generatedOn: 'Apr 1, 2025, 09:01 AM',
    status: 'Complete',
    size: '8.3 MB'
  }
];

const controlStatusData = [
  { name: 'Compliant', value: 147, color: '#4CAF50' },
  { name: 'At Risk', value: 23, color: '#FF9800' },
  { name: 'Non-Compliant', value: 12, color: '#F44336' },
  { name: 'Not Applicable', value: 8, color: '#9E9E9E' },
];

const trendData = [
  { month: 'Jan', compliant: 120, nonCompliant: 35, atRisk: 20 },
  { month: 'Feb', compliant: 125, nonCompliant: 32, atRisk: 18 },
  { month: 'Mar', compliant: 130, nonCompliant: 30, atRisk: 15 },
  { month: 'Apr', compliant: 140, nonCompliant: 25, atRisk: 10 },
  { month: 'May', compliant: 147, nonCompliant: 12, atRisk: 23 },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Compliant': return 'bg-green-500 text-white';
    case 'Attention Required': return 'bg-amber-500 text-white';
    case 'Non-Compliant': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Compliant': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'Attention Required': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'Non-Compliant': return <XCircle className="h-4 w-4 text-red-500" />;
    default: return null;
  }
};

export const ComplianceReporting = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Compliance Dashboard</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="evidence">Evidence Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          {/* Compliance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Framework Compliance</CardTitle>
                <CardDescription>Overall compliance status by framework</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {frameworkData.map((framework) => (
                    <div key={framework.id} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          {getStatusIcon(framework.status)}
                          <span className="ml-2 font-medium">{framework.name}</span>
                        </div>
                        <Badge className={getStatusColor(framework.status)}>
                          {framework.status}
                        </Badge>
                      </div>
                      <Progress 
                        value={framework.coverage} 
                        max={100} 
                        className="h-2" 
                        indicatorClassName={
                          framework.coverage >= 90 ? "bg-green-500" :
                          framework.coverage >= 75 ? "bg-amber-500" : "bg-red-500"
                        } 
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Coverage: {framework.coverage}%</span>
                        <span>Last assessed: {framework.lastAssessment}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Control Status</CardTitle>
                <CardDescription>Distribution of security controls by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={controlStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {controlStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center mt-4 space-x-4">
                  {controlStatusData.map((status, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: status.color }}></div>
                      <span className="text-sm">{status.name}: {status.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Compliance Trend</CardTitle>
                <CardDescription>5-month trend of compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="compliant" stackId="a" fill="#4CAF50" name="Compliant" />
                      <Bar dataKey="atRisk" stackId="a" fill="#FF9800" name="At Risk" />
                      <Bar dataKey="nonCompliant" stackId="a" fill="#F44336" name="Non-Compliant" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6 mt-6">
          {/* Scheduled Reports */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>Automatically generated compliance reports</CardDescription>
              </div>
              <Button size="sm">
                <FileText className="mr-2 h-4 w-4" /> New Report
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledReportsData.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.frequency}</TableCell>
                      <TableCell className="flex items-center">
                        <Clock className="mr-1 h-3 w-3 text-muted-foreground" /> 
                        {report.nextRun}
                      </TableCell>
                      <TableCell>{report.recipients}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">Run Now</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Report History */}
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>Previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Generated On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportHistoryData.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.generatedOn}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.size}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Download className="mr-1 h-3 w-3" /> Download
                          </Button>
                          <Button size="sm" variant="outline">
                            View
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
        
        <TabsContent value="evidence" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Evidence Collection</CardTitle>
                <CardDescription>Automated evidence collection for compliance requirements</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" /> Schedule Collection
                </Button>
                <Button>
                  Collect Now
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <div className="text-4xl font-bold text-green-500">247</div>
                      <div className="text-sm text-center mt-2">Evidence Items Collected</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <div className="text-4xl font-bold text-blue-500">5</div>
                      <div className="text-sm text-center mt-2">Frameworks Covered</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <div className="text-4xl font-bold text-amber-500">87%</div>
                      <div className="text-sm text-center mt-2">Automated Collection</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <div className="text-4xl font-bold text-purple-500">14</div>
                      <div className="text-sm text-center mt-2">Days Until Next Audit</div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Evidence Categories */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Evidence Category</TableHead>
                      <TableHead>Framework</TableHead>
                      <TableHead>Items Collected</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Access Control Logs</TableCell>
                      <TableCell>NIST, PCI DSS</TableCell>
                      <TableCell>42 items</TableCell>
                      <TableCell>Today, 4:30 AM</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Up to date
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">View Evidence</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Firewall Configuration</TableCell>
                      <TableCell>NIST, ISO 27001</TableCell>
                      <TableCell>15 items</TableCell>
                      <TableCell>Yesterday, 10:15 AM</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Up to date
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">View Evidence</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Security Incident Reports</TableCell>
                      <TableCell>HIPAA, SOC 2</TableCell>
                      <TableCell>8 items</TableCell>
                      <TableCell>May 10, 2025</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Needs review
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">View Evidence</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Vulnerability Scan Results</TableCell>
                      <TableCell>All Frameworks</TableCell>
                      <TableCell>23 items</TableCell>
                      <TableCell>May 12, 2025</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Up to date
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">View Evidence</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">User Access Reviews</TableCell>
                      <TableCell>NIST, PCI DSS, SOC 2</TableCell>
                      <TableCell>36 items</TableCell>
                      <TableCell>April 30, 2025</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Outdated
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="default">Collect Now</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
