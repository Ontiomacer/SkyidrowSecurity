
import React, { useState, useEffect } from 'react';
import EnhancedTerminal from './terminal/EnhancedTerminal';
import TerminalConnections from './terminal/TerminalConnections';
import TerminalAiAssistant from './terminal/TerminalAiAssistant';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import { getAiSuggestions } from '@/utils/terminalCommands';
import { Button } from '@/components/ui/button';
import { ExternalLink, Terminal as TerminalIcon, Cpu, Braces, History, Database, Shield, Code } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const Terminal: React.FC<{ className?: string }> = ({ className }) => {
  const [currentInput, setCurrentInput] = useState('');
  const [activeTab, setActiveTab] = useState('splunk');
  const [searchTerm, setSearchTerm] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();
  
  // Handle suggestion selection from AI Assistant
  const handleSuggestionSelect = (command: string) => {
    // This will be passed down to the EnhancedTerminal component
    setCurrentInput(command);
  };

  // Handle diagnostic run
  const handleRunDiagnostics = () => {
    toast({
      title: "Diagnostics Started",
      description: "Running system diagnostics. Results will be shown in the terminal.",
    });
    
    // Send command to terminal
    setCurrentInput('run-diagnostics --verbose');
  };
  
  // Handle connect to endpoint
  const handleConnectToEndpoint = (endpoint: string) => {
    toast({
      title: "Connection Initiated",
      description: `Attempting to connect to ${endpoint}...`,
    });
    
    setIsConnected(true);
    
    // Send connection command to terminal
    setCurrentInput(`connect ${endpoint}`);
  };

  // Handle quick commands
  const handleQuickCommand = (command: string, description: string) => {
    toast({
      title: "Command Executed",
      description: description,
    });
    
    setCurrentInput(command);
  };
  
  // Listen for vulnerability scan events
  useEffect(() => {
    const handleVulnerabilityScan = () => {
      setActiveTab('splunk');
      setCurrentInput('scanvuln --full');
    };
    
    window.addEventListener('start-vulnerability-scan', handleVulnerabilityScan);
    
    return () => {
      window.removeEventListener('start-vulnerability-scan', handleVulnerabilityScan);
    };
  }, []);

  // Handle terminal output
  const handleTerminalOutput = (output: string) => {
    setTerminalOutput(prev => [...prev, output]);
  };
  
  // Navigate to documentation
  const handleOpenDocumentation = () => {
    navigate('/documentation');
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="flex items-center">
          <TerminalIcon className="w-5 h-5 mr-2 text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-200">ThreatHunter Terminal</h2>
          <div className={`ml-3 w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
          {isConnected && <span className="ml-1 text-xs text-green-400">Connected</span>}
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={handleOpenDocumentation}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1" />
            Documentation
          </Button>
          <Button 
            size="sm" 
            className="text-xs"
            onClick={handleRunDiagnostics}
          >
            <Cpu className="w-3.5 h-3.5 mr-1" />
            Run Diagnostics
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <div className="bg-gray-900 border-b border-gray-800">
          <TabsList className="bg-transparent h-9 p-0 ml-2 mt-1">
            <TabsTrigger value="splunk" className="data-[state=active]:bg-gray-800 text-xs h-8 rounded-b-none">
              Splunk Terminal
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-gray-800 text-xs h-8 rounded-b-none">
              Configuration
            </TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-gray-800 text-xs h-8 rounded-b-none">
              Tools
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="splunk" className="flex-1 p-0 m-0">
          <ResizablePanelGroup
            direction="vertical"
            className="h-full"
          >
            <ResizablePanel defaultSize={40} minSize={25}>
              <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={60} minSize={40}>
                  <Card className="h-full rounded-none border-0 border-r border-gray-700">
                    <CardHeader className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                      <CardTitle className="text-sm font-medium text-gray-300">Connection Status</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 h-[calc(100%-40px)] overflow-auto">
                      <div className="p-4 space-y-3">
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3">
                          <h3 className="text-sm font-medium text-gray-300 mb-2">
                            Active Connections
                          </h3>
                          <div className={`text-xs ${isConnected ? 'text-green-400' : 'text-gray-400'}`}>
                            {isConnected ? 
                              "Connected to splunk-server.local" : 
                              "No active connections. Use the terminal to establish connections."}
                          </div>
                        </div>
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3">
                          <h3 className="text-sm font-medium text-gray-300 mb-2">
                            Available Endpoints
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-blue-400">splunk-server.local</div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-6 text-xs"
                                onClick={() => handleConnectToEndpoint('splunk-server.local')}
                              >
                                Connect
                              </Button>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-blue-400">threat-intel.example.com</div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-6 text-xs"
                                onClick={() => handleConnectToEndpoint('threat-intel.example.com')}
                              >
                                Connect
                              </Button>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-blue-400">siem.skyidrow.net</div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-6 text-xs"
                                onClick={() => handleConnectToEndpoint('siem.skyidrow.net')}
                              >
                                Connect
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={40} minSize={30}>
                  <Card className="h-full rounded-none border-0">
                    <CardHeader className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-300">AI Assistant</CardTitle>
                      <div className="bg-blue-600 text-xs text-blue-100 px-2 py-0.5 rounded-full">Active</div>
                    </CardHeader>
                    <CardContent className="p-0 h-[calc(100%-40px)] overflow-auto">
                      <div className="p-4 space-y-3">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search commands..."
                            className="w-full pl-8 py-1.5 text-sm bg-gray-700 border border-gray-600 rounded text-gray-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <svg
                            className="absolute left-2 top-2 h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                        <div className="space-y-2 overflow-y-auto">
                          <div className="bg-gray-700 p-2 rounded hover:bg-gray-600 cursor-pointer"
                               onClick={() => handleSuggestionSelect('ssh admin@splunk-server.local')}>
                            <div className="text-sm font-mono text-blue-400">ssh admin@splunk-server.local</div>
                            <div className="text-xs text-gray-400">Connect to Splunk server via SSH</div>
                          </div>
                          <div className="bg-gray-700 p-2 rounded hover:bg-gray-600 cursor-pointer"
                               onClick={() => handleSuggestionSelect('connect 192.168.1.10 --type=ssh')}>
                            <div className="text-sm font-mono text-blue-400">connect 192.168.1.10 --type=ssh</div>
                            <div className="text-xs text-gray-400">Connect to IP address using SSH</div>
                          </div>
                          <div className="bg-gray-700 p-2 rounded hover:bg-gray-600 cursor-pointer"
                               onClick={() => handleSuggestionSelect('search index=main sourcetype=access_combined | stats count by status')}>
                            <div className="text-sm font-mono text-blue-400">search index=main sourcetype=access_combined | stats count by status</div>
                            <div className="text-xs text-gray-400">Basic Splunk search command</div>
                          </div>
                          <div className="bg-gray-700 p-2 rounded hover:bg-gray-600 cursor-pointer"
                               onClick={() => handleSuggestionSelect('| makeresults | eval query=tostring(random() % 1000)')}>
                            <div className="text-sm font-mono text-blue-400">| makeresults | eval query=tostring(random() % 1000)</div>
                            <div className="text-xs text-gray-400">Generate random test data</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle className="bg-gray-700" />
            <ResizablePanel defaultSize={60} minSize={40}>
              <div className="h-full rounded-md overflow-hidden border border-gray-700">
                <EnhancedTerminal className="h-full" currentInputCommand={currentInput} onTerminalOutput={handleTerminalOutput} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabsContent>
        
        <TabsContent value="config" className="flex-1 p-4">
          <Card>
            <CardHeader>
              <CardTitle>Terminal Configuration</CardTitle>
              <CardDescription>Adjust your terminal settings and connections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Terminal Display Settings</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="flex items-center justify-center">
                    <Code className="h-4 w-4 mr-2" />
                    Terminal Font Settings
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center justify-center">
                    <History className="h-4 w-4 mr-2" />
                    Command History
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Connection Profiles</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center justify-center"
                    onClick={() => handleQuickCommand('ssh-keygen', 'Generating new SSH key pair...')}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Generate SSH Keys
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center justify-center"
                    onClick={() => handleQuickCommand('config --save-profile', 'Saving current profile settings...')}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Save Connection Profile
                  </Button>
                </div>
              </div>
              
              <Button className="w-full mt-4" onClick={() => toast({
                title: "Configuration Saved",
                description: "Your terminal settings have been updated."
              })}>
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tools" className="flex-1 p-4">
          <Card>
            <CardHeader>
              <CardTitle>Splunk Tools</CardTitle>
              <CardDescription>Advanced tools for Splunk operations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">Access diagnostic and administrative tools here.</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleQuickCommand('run-splunk-version', 'Checking Splunk version...')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Check Splunk Version
                </Button>
                <Button
                  onClick={() => handleQuickCommand('run-splunk-status', 'Checking Splunk service status...')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Splunk Status
                </Button>
                <Button
                  onClick={() => handleQuickCommand('validate-splunk-configs', 'Validating Splunk configuration files...')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Validate Configs
                </Button>
                <Button
                  onClick={() => handleQuickCommand('test-splunk-connection', 'Testing connection to Splunk server...')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Test Connection
                </Button>
                <Button
                  onClick={() => handleQuickCommand('splunk btool check', 'Running btool check on Splunk configuration...')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Run btool Check
                </Button>
                <Button
                  onClick={() => handleQuickCommand('install-splunk-app MyApp-1.0.tgz', 'Installing Splunk application...')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Install App
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Terminal;
