
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import EnhancedIOCCorrelation from '@/components/splunk/EnhancedIOCCorrelation';
import { ThreatHunting } from '@/components/splunk/ThreatHunting';
import { ThreatDashboard } from '@/components/splunk/ThreatDashboard';
import { ComplianceReporting } from '@/components/splunk/ComplianceReporting';
import { SPLExamples } from '@/components/splunk/SPLExamples';
import { SplunkAppOverview } from '@/components/splunk/SplunkAppOverview';
import SplunkAppInfo from '@/components/splunk/SplunkAppInfo';
import { 
  Database, 
  Search, 
  BarChart3, 
  FileCheck, 
  Code, 
  Info,
  Brain,
  Network,
  Shield,
  Zap
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const SplunkPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Provide contextual AI guidance
    const tabMessages = {
      'ioc-correlation': {
        title: "Nova AI: IOC Correlation Active",
        description: "I'm ready to help you correlate indicators and find threat relationships using advanced AI algorithms."
      },
      'threat-hunting': {
        title: "Nova AI: Threat Hunting Mode",
        description: "Let's hunt for advanced threats! I can suggest hunting queries and analyze patterns."
      },
      'dashboard': {
        title: "Nova AI: Threat Dashboard",
        description: "Monitoring real-time threat intelligence. I'll alert you to any critical developments."
      },
      'compliance': {
        title: "Nova AI: Compliance Reporting",
        description: "I'm generating compliance reports and ensuring your security posture meets regulatory standards."
      }
    };

    const message = tabMessages[value as keyof typeof tabMessages];
    if (message) {
      toast({
        title: message.title,
        description: message.description,
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ThreatHunter Pro
            </h1>
            <p className="text-muted-foreground flex items-center mt-1">
              <Brain className="h-4 w-4 mr-2 text-purple-600" />
              AI-Enhanced Splunk Integration • Advanced Threat Intelligence Platform
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <Badge className="bg-green-500 animate-pulse">
              <Zap className="h-3 w-3 mr-1" />
              AI Enhanced
            </Badge>
            <Badge variant="outline">
              <Database className="h-3 w-3 mr-1" />
              Splunk Connected
            </Badge>
            <Button size="sm" variant="gradient">
              <Network className="mr-1 h-4 w-4" />
              Live Feed
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="ioc-correlation" className="flex items-center gap-1">
              <Network className="h-4 w-4" />
              <span className="hidden sm:inline">IOC Correlation</span>
            </TabsTrigger>
            <TabsTrigger value="threat-hunting" className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Threat Hunting</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-1">
              <FileCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Compliance</span>
            </TabsTrigger>
            <TabsTrigger value="spl-examples" className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">SPL</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SplunkAppOverview />
              <SplunkAppInfo />
            </div>
          </TabsContent>

          <TabsContent value="ioc-correlation" className="space-y-6">
            <EnhancedIOCCorrelation />
          </TabsContent>

          <TabsContent value="threat-hunting" className="space-y-6">
            <ThreatHunting />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <ThreatDashboard />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <ComplianceReporting />
          </TabsContent>

          <TabsContent value="spl-examples" className="space-y-6">
            <SPLExamples />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SplunkPage;
