
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Download, Shield, AlertCircle, Activity, Database, FileDown, ArrowDownToLine } from 'lucide-react';
import { generateMockReport, downloadReport, ReportData } from '@/services/ReportService';

// Sample data for the charts
const threatData = [
  { name: 'SQL Injection', count: 24 },
  { name: 'Brute Force', count: 17 },
  { name: 'XSS', count: 13 },
  { name: 'Malware', count: 9 },
  { name: 'Phishing', count: 21 },
  { name: 'DDoS', count: 5 },
];

const systemData = [
  { name: 'Web Servers', value: 35 },
  { name: 'Databases', value: 25 },
  { name: 'Endpoints', value: 30 },
  { name: 'Network Devices', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const threatSeverity = [
  { name: 'Critical', count: 8 },
  { name: 'High', count: 15 },
  { name: 'Medium', count: 22 },
  { name: 'Low', count: 19 },
];

const AnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisComplete(false);
    
    // Simulate analysis progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setAnalysisProgress(i);
    }
    
    // Generate mock report when complete
    const report = await generateMockReport('analysis', 'Comprehensive Threat');
    setGeneratedReport(report);
    setAnalysisComplete(true);
    setIsAnalyzing(false);
    
    toast({
      title: 'Analysis Complete',
      description: 'AI threat analysis has completed successfully.',
    });
  };
  
  const handleDownloadReport = (format: 'pdf' | 'csv') => {
    if (!generatedReport) {
      toast({
        title: 'Error',
        description: 'No report available to download',
        variant: 'destructive',
      });
      return;
    }
    
    downloadReport(generatedReport);
    
    toast({
      title: `${format.toUpperCase()} Downloaded`,
      description: `Your ${format.toUpperCase()} report has been downloaded.`,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Threat Analysis Engine</h1>
            <p className="text-muted-foreground">AI-powered real-time security analysis</p>
          </div>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <Button
              variant="default"
              size="sm"
              onClick={startAnalysis}
              disabled={isAnalyzing}
              className="flex items-center"
            >
              <Activity className="mr-1 h-4 w-4" />
              {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadReport('pdf')}
              disabled={!analysisComplete}
              className="flex items-center"
            >
              <FileDown className="mr-1 h-4 w-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadReport('csv')}
              disabled={!analysisComplete}
              className="flex items-center"
            >
              <ArrowDownToLine className="mr-1 h-4 w-4" />
              CSV
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="threats">Threats</TabsTrigger>
            <TabsTrigger value="logs">Log Analysis</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6 space-y-6">
            {/* Analysis Status Card */}
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardHeader className="border-b border-gray-700 pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-400 mr-2" />
                    AI Analysis Status
                    {isAnalyzing ? (
                      <Badge className="ml-2 bg-yellow-600 animate-pulse">In Progress</Badge>
                    ) : analysisComplete ? (
                      <Badge className="ml-2 bg-green-600">Complete</Badge>
                    ) : (
                      <Badge className="ml-2 bg-gray-600">Ready</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {isAnalyzing ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Analysis Progress</span>
                      <span>{analysisProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${analysisProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      The AI is scanning logs, analyzing network traffic, and correlating threats...
                    </p>
                  </div>
                ) : analysisComplete ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-700 p-3 rounded-md shadow-inner">
                        <h3 className="text-sm font-medium text-gray-300">Threats Detected</h3>
                        <p className="text-2xl font-bold text-red-500">42</p>
                      </div>
                      <div className="bg-gray-700 p-3 rounded-md shadow-inner">
                        <h3 className="text-sm font-medium text-gray-300">Affected Systems</h3>
                        <p className="text-2xl font-bold text-yellow-500">8</p>
                      </div>
                      <div className="bg-gray-700 p-3 rounded-md shadow-inner">
                        <h3 className="text-sm font-medium text-gray-300">Risk Score</h3>
                        <p className="text-2xl font-bold text-orange-500">76%</p>
                      </div>
                      <div className="bg-gray-700 p-3 rounded-md shadow-inner">
                        <h3 className="text-sm font-medium text-gray-300">MITRE ATT&CK</h3>
                        <p className="text-2xl font-bold text-blue-500">12</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-300">
                      <h3 className="font-medium mb-1">Key Findings:</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-400">
                        <li>Multiple brute force attempts from IP range 203.0.113.0/24</li>
                        <li>Unusual outbound traffic to known C2 servers</li>
                        <li>Evidence of credential harvesting on 3 systems</li>
                        <li>Critical vulnerability CVE-2023-45693 exploited</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Shield className="h-16 w-16 text-gray-500 mb-4" />
                    <p className="text-gray-400 text-center">
                      Click "Start Analysis" to begin AI-powered threat detection
                    </p>
                    <Button 
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                      onClick={startAnalysis}
                    >
                      Start Analysis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chart Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700 shadow-lg">
                <CardHeader className="border-b border-gray-700 pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <AlertCircle className="h-4 w-4 text-blue-400 mr-2" />
                    Threat Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={threatData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" stroke="#999" />
                        <YAxis stroke="#999" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#333', border: '1px solid #555' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Bar dataKey="count" fill="#7aa2f7" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 shadow-lg">
                <CardHeader className="border-b border-gray-700 pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Database className="h-4 w-4 text-blue-400 mr-2" />
                    Affected Systems
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={systemData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {systemData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#333', border: '1px solid #555' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="threats" className="mt-6 space-y-6">
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardHeader className="border-b border-gray-700 pb-3">
                <CardTitle>Detected Threats</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {threatSeverity.map((severity) => (
                    <div key={severity.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            severity.name === 'Critical' ? 'bg-red-500' :
                            severity.name === 'High' ? 'bg-orange-500' :
                            severity.name === 'Medium' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}></span>
                          <span className="font-medium">{severity.name}</span>
                        </div>
                        <span className="text-sm text-gray-400">{severity.count} threats</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            severity.name === 'Critical' ? 'bg-red-500' :
                            severity.name === 'High' ? 'bg-orange-500' :
                            severity.name === 'Medium' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}
                          style={{ width: `${(severity.count / Math.max(...threatSeverity.map(s => s.count))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Recent Alerts</h3>
                  <div className="space-y-2">
                    {[
                      { time: '15:42:33', type: 'Critical', message: 'SQL Injection attempt detected on web server', ip: '203.0.113.42' },
                      { time: '14:28:11', type: 'High', message: 'Multiple login failures for admin account', ip: '198.51.100.77' },
                      { time: '13:55:47', type: 'High', message: 'Abnormal data exfiltration detected', ip: '192.168.1.45' },
                      { time: '12:32:18', type: 'Medium', message: 'Unusual process execution on database server', ip: '192.168.1.20' },
                      { time: '11:15:05', type: 'Critical', message: 'Possible ransomware behavior detected', ip: '192.168.1.67' },
                    ].map((alert, i) => (
                      <div key={i} className="bg-gray-700 p-2 rounded flex justify-between items-center">
                        <div>
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            alert.type === 'Critical' ? 'bg-red-500' :
                            alert.type === 'High' ? 'bg-orange-500' :
                            'bg-yellow-500'
                          }`}></span>
                          <span className="text-sm">{alert.message}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          <span>{alert.time}</span>
                          <span className="ml-2 px-1.5 py-0.5 bg-gray-600 rounded">
                            {alert.ip}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-700 pt-3">
                <Button variant="outline" className="w-full">View All Threats</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-6 space-y-6">
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardHeader className="border-b border-gray-700 pb-3">
                <CardTitle className="flex justify-between items-center">
                  <span>Log Analysis</span>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-700">Live</Badge>
                    <span className="text-xs text-gray-400">Updating every 5s</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="bg-gray-900 font-mono text-sm text-gray-300 p-4 rounded-md h-[400px] overflow-auto">
                  {[
                    { time: '15:45:12', level: 'INFO', message: 'User authentication successful for admin', color: 'text-blue-400' },
                    { time: '15:42:33', level: 'ERROR', message: 'SQL Injection attempt detected from 203.0.113.42', color: 'text-red-400' },
                    { time: '15:40:21', level: 'WARN', message: 'Failed login attempt for user admin from 198.51.100.77', color: 'text-yellow-400' },
                    { time: '15:39:05', level: 'INFO', message: 'Firewall rule update applied successfully', color: 'text-blue-400' },
                    { time: '15:36:49', level: 'WARN', message: 'Unusual outbound connection to 93.184.216.34:4444', color: 'text-yellow-400' },
                    { time: '15:32:27', level: 'ERROR', message: 'File permission modification on critical system file: /etc/passwd', color: 'text-red-400' },
                    { time: '15:30:15', level: 'INFO', message: 'System scan completed - 3 vulnerabilities found', color: 'text-blue-400' },
                    { time: '15:28:56', level: 'INFO', message: 'User admin logged in from 192.168.1.100', color: 'text-blue-400' },
                    { time: '15:25:43', level: 'WARN', message: 'DNS request to known malicious domain blocked', color: 'text-yellow-400' },
                    { time: '15:22:31', level: 'ERROR', message: 'Critical service apache2 restarted unexpectedly', color: 'text-red-400' },
                    { time: '15:20:18', level: 'INFO', message: 'Backup completed successfully', color: 'text-blue-400' },
                    { time: '15:18:05', level: 'WARN', message: 'High CPU usage on database server (92%)', color: 'text-yellow-400' },
                    { time: '15:15:59', level: 'INFO', message: 'New security patch applied: CVE-2023-32233', color: 'text-blue-400' },
                    { time: '15:12:47', level: 'INFO', message: 'Network scan initiated by user admin', color: 'text-blue-400' },
                    { time: '15:10:35', level: 'WARN', message: 'Multiple failed login attempts for user jenkins', color: 'text-yellow-400' },
                  ].map((log, i) => (
                    <div key={i} className="mb-1">
                      <span className="text-gray-500">[{log.time}]</span>{' '}
                      <span className={log.color}>[{log.level}]</span>{' '}
                      <span>{log.message}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex justify-between">
                  <Button variant="outline" size="sm">
                    Filter Logs
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center" onClick={() => startAnalysis()}>
                    <Activity className="mr-1 h-4 w-4" />
                    Analyze Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6 space-y-6">
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardHeader className="border-b border-gray-700 pb-3">
                <CardTitle>Generated Reports</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {analysisComplete ? (
                    <>
                      <div className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-blue-400 mr-2" />
                          <div>
                            <p className="font-medium">{generatedReport?.title}</p>
                            <p className="text-xs text-gray-400">Generated {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex items-center" onClick={() => handleDownloadReport('pdf')}>
                            <Download className="h-3.5 w-3.5 mr-1" />
                            PDF
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center" onClick={() => handleDownloadReport('csv')}>
                            <Download className="h-3.5 w-3.5 mr-1" />
                            CSV
                          </Button>
                        </div>
                      </div>
                      <div className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-blue-400 mr-2" />
                          <div>
                            <p className="font-medium">Weekly Security Summary</p>
                            <p className="text-xs text-gray-400">Generated {new Date(Date.now() - 86400000).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex items-center">
                            <Download className="h-3.5 w-3.5 mr-1" />
                            PDF
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center">
                            <Download className="h-3.5 w-3.5 mr-1" />
                            CSV
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-700 p-6 rounded-md flex flex-col items-center justify-center">
                      <FileText className="h-10 w-10 text-gray-500 mb-2" />
                      <p className="text-gray-400">No reports have been generated yet</p>
                      <p className="text-xs text-gray-500 mt-1">Run an analysis to generate reports</p>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                        onClick={startAnalysis}
                      >
                        Generate Report
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AnalysisPage;
