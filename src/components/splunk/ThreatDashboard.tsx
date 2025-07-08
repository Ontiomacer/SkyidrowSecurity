
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const threatData = [
  { name: 'Critical', value: 5, color: '#FF4D4F' },
  { name: 'High', value: 12, color: '#FAAD14' },
  { name: 'Medium', value: 23, color: '#1890FF' },
  { name: 'Low', value: 45, color: '#52C41A' },
];

const timelineData = [
  { time: '1h', alerts: 12 },
  { time: '2h', alerts: 19 },
  { time: '3h', alerts: 8 },
  { time: '4h', alerts: 5 },
  { time: '5h', alerts: 15 },
  { time: '6h', alerts: 22 },
  { time: '7h', alerts: 18 },
  { time: '8h', alerts: 14 },
];

const attackTypeData = [
  { name: 'Malware', value: 35 },
  { name: 'Phishing', value: 25 },
  { name: 'Data Exfil', value: 15 },
  { name: 'Brute Force', value: 10 },
  { name: 'C2 Traffic', value: 15 },
];

const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const topThreats = [
  { id: 1, name: 'Beaconing to suspicious IP', severity: 'Critical', time: '10 min ago', source: 'Firewall' },
  { id: 2, name: 'PowerShell obfuscation detected', severity: 'High', time: '15 min ago', source: 'EDR' },
  { id: 3, name: 'Multiple failed authentications', severity: 'High', time: '23 min ago', source: 'Windows Logs' },
  { id: 4, name: 'Large data transfer to external host', severity: 'Critical', time: '45 min ago', source: 'DLP' },
  { id: 5, name: 'Known malicious hash detected', severity: 'Critical', time: '1 hour ago', source: 'Anti-Virus' },
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'Critical': return 'bg-red-500';
    case 'High': return 'bg-amber-500';
    case 'Medium': return 'bg-blue-500';
    case 'Low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

export const ThreatDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Threat Overview */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Threat Overview</CardTitle>
          <CardDescription>Current threat levels by severity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Critical</span>
              <span className="text-red-500 font-bold">{threatData[0].value}</span>
            </div>
            <Progress value={threatData[0].value} max={50} className="bg-gray-200 h-2" indicatorClassName="bg-red-500" />
            
            <div className="flex justify-between items-center">
              <span className="font-medium">High</span>
              <span className="text-amber-500 font-bold">{threatData[1].value}</span>
            </div>
            <Progress value={threatData[1].value} max={50} className="bg-gray-200 h-2" indicatorClassName="bg-amber-500" />
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Medium</span>
              <span className="text-blue-500 font-bold">{threatData[2].value}</span>
            </div>
            <Progress value={threatData[2].value} max={50} className="bg-gray-200 h-2" indicatorClassName="bg-blue-500" />
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Low</span>
              <span className="text-green-500 font-bold">{threatData[3].value}</span>
            </div>
            <Progress value={threatData[3].value} max={50} className="bg-gray-200 h-2" indicatorClassName="bg-green-500" />
            
            <Separator className="my-4" />
            
            <div className="text-center">
              <div className="text-2xl font-bold">{threatData.reduce((acc, item) => acc + item.value, 0)}</div>
              <div className="text-sm text-muted-foreground">Total Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Alert Timeline */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Alert Timeline</CardTitle>
          <CardDescription>Alert volume over the past 8 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="alerts" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Attack Types */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Attack Types</CardTitle>
          <CardDescription>Distribution of detected threat types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attackTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {attackTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Top Threats */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Active Threats</CardTitle>
          <CardDescription>Most recent and critical security events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topThreats.map((threat) => (
              <div key={threat.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className={`w-3 h-3 rounded-full ${getSeverityColor(threat.severity)} mr-3`}></div>
                <div className="flex-1">
                  <div className="font-medium">{threat.name}</div>
                  <div className="text-sm text-muted-foreground">{threat.source} • {threat.time}</div>
                </div>
                <Badge className={`${getSeverityColor(threat.severity)} text-white`}>{threat.severity}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* MITRE ATT&CK Coverage */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>MITRE ATT&CK Coverage</CardTitle>
          <CardDescription>Current coverage across tactics and techniques</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Initial Access', coverage: 85 },
                  { name: 'Execution', coverage: 92 },
                  { name: 'Persistence', coverage: 78 },
                  { name: 'Privilege Escalation', coverage: 65 },
                  { name: 'Defense Evasion', coverage: 70 },
                  { name: 'Credential Access', coverage: 88 },
                  { name: 'Discovery', coverage: 75 },
                  { name: 'Lateral Movement', coverage: 62 },
                  { name: 'Collection', coverage: 80 },
                  { name: 'Exfiltration', coverage: 85 },
                  { name: 'Command & Control', coverage: 90 },
                  { name: 'Impact', coverage: 72 },
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="coverage" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
