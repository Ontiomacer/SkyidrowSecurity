import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, FileText, Box, Layers, 
  CheckCircle, AlertCircle, HelpCircle, 
  Server, Database, ExternalLink
} from 'lucide-react';

const SplunkAppInfo = () => {
  const [activeTab, setActiveTab] = React.useState('overview');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>ThreatHunter Pro - App Information</CardTitle>
              <CardDescription>
                Technical details and documentation for Splunk administrators
              </CardDescription>
            </div>
            <Badge variant="secondary" className="px-3 py-1.5">
              Version 1.2.3
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="architecture">Architecture</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="deployment">Deployment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="prose max-w-none dark:prose-invert">
                <h3>ThreatHunter Pro Application</h3>
                <p>
                  ThreatHunter Pro is a comprehensive security analytics application built for Splunk,
                  designed to streamline threat detection, investigation, and response workflows.
                  It combines powerful dashboards, interactive visualizations, and an integrated 
                  terminal interface to help security teams identify and mitigate threats efficiently.
                </p>
                <h4>Key Features</h4>
                <ul>
                  <li><strong>Real-time Security Dashboards</strong>: Visualize threats and security posture</li>
                  <li><strong>IOC Correlation Engine</strong>: Automatically match indicators of compromise</li>
                  <li><strong>Threat Hunting Toolkit</strong>: Pre-built and custom queries for proactive hunting</li>
                  <li><strong>Integrated Terminal</strong>: Direct SPL command execution and system interaction</li>
                  <li><strong>Compliance Reporting</strong>: Pre-built reports for regulatory frameworks</li>
                </ul>
                <p>
                  This app leverages Splunk's powerful search capabilities and extends them with security-focused 
                  visualizations and workflows specifically designed for security operations teams.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Primary Use Case
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Security monitoring, threat detection, and incident response</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Documentation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="text-sm w-full" size="sm">
                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                      View Docs
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="architecture" className="space-y-4">
              <div className="prose max-w-none dark:prose-invert">
                <h3>Application Architecture</h3>
                <p>
                  ThreatHunter Pro follows a modular architecture that integrates with Splunk's core 
                  components while providing specialized security analytics capabilities.
                </p>
                
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-800 text-white px-3 py-2 rounded-md mb-2 text-center w-64">
                      User Interface Layer
                    </div>
                    <div className="flex justify-between w-full my-2">
                      <div className="bg-blue-700 text-white px-3 py-1 rounded-md text-sm text-center w-48">Dashboards</div>
                      <div className="bg-blue-700 text-white px-3 py-1 rounded-md text-sm text-center w-48">Search Interface</div>
                      <div className="bg-blue-700 text-white px-3 py-1 rounded-md text-sm text-center w-48">Terminal</div>
                    </div>
                    <div className="bg-purple-800 text-white px-3 py-2 rounded-md my-2 text-center w-64">
                      Application Logic Layer
                    </div>
                    <div className="flex justify-between w-full my-2">
                      <div className="bg-purple-700 text-white px-3 py-1 rounded-md text-sm text-center w-48">
                        Query Handlers
                      </div>
                      <div className="bg-purple-700 text-white px-3 py-1 rounded-md text-sm text-center w-48">
                        Visualization Engine
                      </div>
                      <div className="bg-purple-700 text-white px-3 py-1 rounded-md text-sm text-center w-48">
                        API Integrations
                      </div>
                    </div>
                    <div className="bg-green-800 text-white px-3 py-2 rounded-md my-2 text-center w-64">
                      Data Processing Layer
                    </div>
                    <div className="flex justify-between w-full my-2">
                      <div className="bg-green-700 text-white px-3 py-1 rounded-md text-sm text-center w-48">
                        Search Processing
                      </div>
                      <div className="bg-green-700 text-white px-3 py-1 rounded-md text-sm text-center w-48">
                        Data Models
                      </div>
                      <div className="bg-green-700 text-white px-3 py-1 rounded-md text-sm text-center w-48">
                        Correlation Engine
                      </div>
                    </div>
                    <div className="bg-gray-700 text-white px-3 py-2 rounded-md my-2 text-center w-64">
                      Splunk Core Services
                    </div>
                  </div>
                </div>
                
                <h4>Component Interactions</h4>
                <p>
                  The app's modules interact with Splunk's core services through standard APIs and 
                  extend functionality with custom visualizations and processing logic:
                </p>
                <ul>
                  <li>Custom dashboards built on Splunk Dashboard Framework</li>
                  <li>Specialized visualizations for security data representation</li>
                  <li>Backend scripts for data enrichment and correlation</li>
                  <li>Terminal interface for direct command execution</li>
                  <li>REST endpoints for external integrations</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="requirements" className="space-y-4">
              <div className="prose max-w-none dark:prose-invert">
                <h3>System Requirements</h3>
                <p>
                  ThreatHunter Pro is designed to work with current Splunk Enterprise and Splunk Cloud
                  environments. Below are the minimum requirements for optimal performance.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Server className="h-5 w-5 mr-2" />
                        Splunk Environment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm font-medium">Splunk Enterprise</span>
                        <div className="flex items-center">
                          <span className="text-sm">8.x or later</span>
                          <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm font-medium">Splunk Cloud</span>
                        <div className="flex items-center">
                          <span className="text-sm">Compatible</span>
                          <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm font-medium">App Compatibility</span>
                        <div className="flex items-center">
                          <span className="text-sm">AppInspect Certified</span>
                          <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Database className="h-5 w-5 mr-2" />
                        Data Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm font-medium">Technology Add-ons</span>
                        <div className="flex items-center">
                          <span className="text-sm">Common security TAs</span>
                          <HelpCircle className="h-4 w-4 ml-2 text-blue-500" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm font-medium">Index Volume</span>
                        <div className="flex items-center">
                          <span className="text-sm">Scales with deployment</span>
                          <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm font-medium">KV Store Usage</span>
                        <div className="flex items-center">
                          <span className="text-sm">Required</span>
                          <AlertCircle className="h-4 w-4 ml-2 text-yellow-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <h4 className="mt-6">Browser Compatibility</h4>
                <p>
                  The app's web interface is compatible with modern web browsers:
                </p>
                <ul>
                  <li><strong>Google Chrome:</strong> Version 90+</li>
                  <li><strong>Mozilla Firefox:</strong> Version 88+</li>
                  <li><strong>Microsoft Edge:</strong> Version 90+</li>
                  <li><strong>Safari:</strong> Version 14+</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="deployment" className="space-y-4">
              <div className="prose max-w-none dark:prose-invert">
                <h3>Deployment Guide</h3>
                <p>
                  This section provides guidance for deploying ThreatHunter Pro in various Splunk 
                  environments, including standalone, distributed, and cloud deployments.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Box className="h-5 w-5 mr-2" />
                        Standalone Deployment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <ol className="list-decimal list-inside text-sm space-y-2">
                        <li>Download the app package from the repository</li>
                        <li>Install to <code>$SPLUNK_HOME/etc/apps/</code></li>
                        <li>Restart Splunk service</li>
                        <li>Access via Splunk web interface</li>
                        <li>Complete initial setup wizard</li>
                      </ol>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Layers className="h-5 w-5 mr-2" />
                        Distributed Deployment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <ol className="list-decimal list-inside text-sm space-y-2">
                        <li>Install on search heads and deployment server</li>
                        <li>Configure app via deployment server</li>
                        <li>Deploy to search heads via server class</li>
                        <li>Install supporting add-ons on indexers/forwarders</li>
                        <li>Validate search head clustering compatibility</li>
                      </ol>
                    </CardContent>
                  </Card>
                </div>
                
                <h4 className="mt-6">Splunk Cloud Deployment</h4>
                <p>
                  For Splunk Cloud deployments, follow these steps:
                </p>
                <ol>
                  <li>Request app installation via Splunk Cloud Support</li>
                  <li>Provide AppInspect validation report</li>
                  <li>Configure app settings after installation</li>
                  <li>Set up necessary inputs on heavy forwarders</li>
                </ol>
                
                <div className="bg-blue-900/30 border border-blue-800 rounded-md p-4 mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExternalLink className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-400">Additional Resources</h3>
                      <p className="mt-2 text-sm text-blue-200">
                        For detailed deployment instructions and best practices, refer to our 
                        <a href="#" className="font-medium text-blue-400 hover:text-blue-300"> comprehensive documentation</a> 
                        or contact <a href="#" className="font-medium text-blue-400 hover:text-blue-300">Splunk support</a>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SplunkAppInfo;
