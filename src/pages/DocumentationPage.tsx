
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Search, Code, Shield, Terminal, Database } from 'lucide-react';

const DocumentationPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
            <p className="text-muted-foreground">Security platform user guides and reference</p>
          </div>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search documentation..."
                className="pl-9 py-2 pr-4 rounded-md bg-gray-800 border border-gray-700 text-sm w-[200px] md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader className="border-b border-gray-700 pb-3">
              <CardTitle className="text-lg">Contents</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="flex flex-col">
                {[
                  { id: 'overview', icon: <FileText className="h-4 w-4 mr-2" />, name: 'Platform Overview' },
                  { id: 'terminal', icon: <Terminal className="h-4 w-4 mr-2" />, name: 'Terminal Commands' },
                  { id: 'ai', icon: <Code className="h-4 w-4 mr-2" />, name: 'AI Features' },
                  { id: 'security', icon: <Shield className="h-4 w-4 mr-2" />, name: 'Security Models' },
                  { id: 'integrations', icon: <Database className="h-4 w-4 mr-2" />, name: 'Integrations' },
                ].map((item) => (
                  <button
                    key={item.id}
                    className={`flex items-center px-4 py-3 hover:bg-gray-700 transition-colors ${
                      activeTab === item.id ? 'bg-gray-700 border-l-2 border-blue-500' : ''
                    }`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card className="lg:col-span-3 bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader className="border-b border-gray-700 pb-3">
              <CardTitle>
                {activeTab === 'overview' && 'Platform Overview'}
                {activeTab === 'terminal' && 'Terminal Commands'}
                {activeTab === 'ai' && 'AI Features'}
                {activeTab === 'security' && 'Security Models'}
                {activeTab === 'integrations' && 'Integrations'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                <div className="space-y-6">
                  {activeTab === 'overview' && (
                    <>
                      <section className="space-y-2">
                        <h2 className="text-xl font-semibold text-blue-400">Introduction</h2>
                        <p>
                          The Skyidrow Security Intelligence Platform is a comprehensive security operations
                          solution designed for modern cybersecurity teams. This documentation provides an
                          overview of the platform's features and functionality.
                        </p>
                      </section>
                      
                      <section className="space-y-2">
                        <h2 className="text-xl font-semibold text-blue-400">Key Features</h2>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Real-time threat detection and analysis with AI assistance</li>
                          <li>Secure terminal for direct system interaction</li>
                          <li>Built-in phishing simulation platform</li>
                          <li>Vulnerability scanning and management</li>
                          <li>Splunk integration for advanced SIEM capabilities</li>
                          <li>Automated reporting and compliance documentation</li>
                        </ul>
                      </section>
                      
                      <section className="space-y-2">
                        <h2 className="text-xl font-semibold text-blue-400">Dashboards</h2>
                        <p>
                          The platform includes multiple specialized dashboards:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li><strong>Home Dashboard:</strong> Overview of security posture and key metrics</li>
                          <li><strong>Analysis Dashboard:</strong> Detailed threat intelligence and investigation tools</li>
                          <li><strong>Simulation Dashboard:</strong> Phishing campaign creation and results tracking</li>
                          <li><strong>Splunk Dashboard:</strong> Integration with the Threat Hunter Pro view</li>
                        </ul>
                      </section>
                      
                      <section className="space-y-2">
                        <h2 className="text-xl font-semibold text-blue-400">System Requirements</h2>
                        <table className="min-w-full border border-gray-700 text-sm">
                          <thead>
                            <tr className="bg-gray-700">
                              <th className="py-2 px-4 border-b border-gray-600 text-left">Component</th>
                              <th className="py-2 px-4 border-b border-gray-600 text-left">Minimum</th>
                              <th className="py-2 px-4 border-b border-gray-600 text-left">Recommended</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="py-2 px-4 border-b border-gray-700">CPU</td>
                              <td className="py-2 px-4 border-b border-gray-700">4 cores</td>
                              <td className="py-2 px-4 border-b border-gray-700">8+ cores</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-4 border-b border-gray-700">Memory</td>
                              <td className="py-2 px-4 border-b border-gray-700">16GB</td>
                              <td className="py-2 px-4 border-b border-gray-700">32GB+</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-4 border-b border-gray-700">Storage</td>
                              <td className="py-2 px-4 border-b border-gray-700">100GB SSD</td>
                              <td className="py-2 px-4 border-b border-gray-700">500GB+ SSD</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-4 border-b border-gray-700">Network</td>
                              <td className="py-2 px-4 border-b border-gray-700">100Mbps</td>
                              <td className="py-2 px-4 border-b border-gray-700">1Gbps+</td>
                            </tr>
                          </tbody>
                        </table>
                      </section>
                    </>
                  )}

                  {activeTab === 'terminal' && (
                    <>
                      <section className="space-y-2">
                        <h2 className="text-xl font-semibold text-blue-400">Terminal Overview</h2>
                        <p>
                          The integrated secure terminal provides a command-line interface for interacting with systems,
                          running security tools, and accessing AI-powered analysis features.
                        </p>
                      </section>

                      <section className="space-y-2">
                        <h2 className="text-xl font-semibold text-blue-400">Basic Commands</h2>
                        <div className="bg-gray-900 rounded-md p-4 font-mono text-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <span className="text-blue-400">ls</span>
                              <p className="text-gray-400 text-xs">List files in current directory</p>
                            </div>
                            <div>
                              <span className="text-blue-400">cat [filename]</span>
                              <p className="text-gray-400 text-xs">Display file contents</p>
                            </div>
                            <div>
                              <span className="text-blue-400">tail [-f] [filename]</span>
                              <p className="text-gray-400 text-xs">Display end of file (with optional follow)</p>
                            </div>
                            <div>
                              <span className="text-blue-400">ping [host]</span>
                              <p className="text-gray-400 text-xs">Test network connectivity</p>
                            </div>
                            <div>
                              <span className="text-blue-400">connect [host] [--type=ssh|agent]</span>
                              <p className="text-gray-400 text-xs">Connect to remote system</p>
                            </div>
                            <div>
                              <span className="text-blue-400">ssh user@host</span>
                              <p className="text-gray-400 text-xs">Connect via SSH to remote system</p>
                            </div>
                            <div>
                              <span className="text-blue-400">disconnect</span>
                              <p className="text-gray-400 text-xs">End current connection</p>
                            </div>
                            <div>
                              <span className="text-blue-400">curl [url]</span>
                              <p className="text-gray-400 text-xs">Make HTTP request</p>
                            </div>
                            <div>
                              <span className="text-blue-400">clear</span>
                              <p className="text-gray-400 text-xs">Clear terminal screen</p>
                            </div>
                            <div>
                              <span className="text-blue-400">systeminfo</span>
                              <p className="text-gray-400 text-xs">Display system information</p>
                            </div>
                            <div>
                              <span className="text-blue-400">netstat</span>
                              <p className="text-gray-400 text-xs">Show network connections</p>
                            </div>
                            <div>
                              <span className="text-blue-400">scanvuln [target]</span>
                              <p className="text-gray-400 text-xs">Run vulnerability scan</p>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="space-y-2">
                        <h2 className="text-xl font-semibold text-blue-400">Navigation Commands</h2>
                        <div className="bg-gray-900 rounded-md p-4 font-mono text-sm">
                          <div className="space-y-2">
                            <div>
                              <span className="text-blue-400">pages</span>
                              <p className="text-gray-400 text-xs">Show available pages for navigation</p>
                            </div>
                            <div>
                              <span className="text-blue-400">goto [page]</span>
                              <p className="text-gray-400 text-xs">Navigate to different pages in the application</p>
                            </div>
                            <div>
                              <span className="text-blue-400">nav [page]</span>
                              <p className="text-gray-400 text-xs">Alias for goto command</p>
                            </div>
                          </div>
                        </div>
                      </section>
                    </>
                  )}

                  {activeTab === 'ai' && (
                    <>
                      <section className="space-y-2">
                        <h2 className="text-xl font-semibold text-blue-400">AI-Powered Features</h2>
                        <p>
                          The platform includes advanced AI capabilities for threat detection, log analysis, and
                          security reporting. These features help security teams identify and respond to threats faster.
                        </p>
                      </section>

                      <section className="space-y-2">
                        <h2 className="text-xl font-semibold text-blue-400">AI Terminal Commands</h2>
                        <div className="bg-gray-900 rounded-md p-4 font-mono text-sm">
                          <div className="space-y-3">
                            <div>
                              <span className="text-blue-400">ai-assist</span>
                              <p className="text-gray-400 text-xs">Show AI assistance options</p>
                            </div>
                            <div>
                              <span className="text-blue-400">ai-analyze [log_path]</span>
                              <p className="text-gray-400 text-xs">Analyze logs for security anomalies</p>
                              <p className="text-gray-500 text-xs italic mt-1">Example: ai-analyze /var/log/auth.log</p>
                            </div>
                            <div>
                              <span className="text-blue-400">ai-summarize</span>
                              <p className="text-gray-400 text-xs">Summarize current terminal output or log content</p>
                            </div>
                            <div>
                              <span className="text-blue-400">ai-suggest</span>
                              <p className="text-gray-400 text-xs">Get AI command suggestions based on context</p>
                            </div>
                            <div>
                              <span className="text-blue-400">ai-report</span>
                              <p className="text-gray-400 text-xs">Generate comprehensive threat intelligence report</p>
                            </div>
                            <div>
                              <span className="text-blue-400">ai-export [format]</span>
                              <p className="text-gray-400 text-xs">Export analysis results as PDF or CSV</p>
                              <p className="text-gray-500 text-xs italic mt-1">Example: ai-export pdf</p>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="space-y-2">
                        <h2 className="text-xl font-semibold text-blue-400">AI Analysis Dashboard</h2>
                        <p>
                          The AI Analysis Dashboard provides a visual interface for:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Real-time log monitoring and anomaly detection</li>
                          <li>Automated threat classification and prioritization</li>
                          <li>Security incident visualization and correlation</li>
                          <li>Report generation with detailed findings and recommendations</li>
                        </ul>
                      </section>
                    </>
                  )}

                  {activeTab === 'security' && (
                    <>
                      <section className="space-y-2">
                        <h2 className="text-xl font-semibold text-blue-400">Security Models</h2>
                        <p>
                          The platform implements several security models and frameworks to provide comprehensive
                          protection and analysis capabilities.
                        </p>
                      </section>

                      <section className="space-y-2">
                        <h2 className="text-xl font-semibold text-blue-400">MITRE ATT&CK Framework</h2>
                        <p>
                          The platform maps detected threats to the MITRE ATT&CK framework, providing context and
                          helping security teams understand adversary tactics, techniques, and procedures (TTPs).
                        </p>
                        <div className="bg-gray-900 rounded-md p-4 text-sm">
                          <h3 className="font-semibold mb-2">Key ATT&CK Categories:</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Initial Access</li>
                            <li>Execution</li>
                            <li>Persistence</li>
                            <li>Privilege Escalation</li>
                            <li>Defense Evasion</li>
                            <li>Credential Access</li>
                            <li>Discovery</li>
                            <li>Lateral Movement</li>
                            <li>Collection</li>
                            <li>Command and Control</li>
                            <li>Exfiltration</li>
                            <li>Impact</li>
                          </ul>
                        </div>
                      </section>

                      <section className="space-y-2">
                        <h2 className="text-xl font-semibold text-blue-400">Compliance Frameworks</h2>
                        <p>
                          The platform supports reporting and analysis for various compliance frameworks:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-900 rounded-md p-4 text-sm">
                            <h3 className="font-semibold mb-2">NIST CSF</h3>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Identify</li>
                              <li>Protect</li>
                              <li>Detect</li>
                              <li>Respond</li>
                              <li>Recover</li>
                            </ul>
                          </div>
                          <div className="bg-gray-900 rounded-md p-4 text-sm">
                            <h3 className="font-semibold mb-2">ISO 27001</h3>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Information Security Policies</li>
                              <li>Organization of Information Security</li>
                              <li>Human Resources Security</li>
                              <li>Asset Management</li>
                              <li>Access Control</li>
                              <li>Cryptography</li>
                            </ul>
                          </div>
                        </div>
                      </section>
                    </>
                  )}

                  {activeTab === 'integrations' && (
                    <>
                      <section className="space-y-2">
                        <h2 className="text-xl font-semibold text-blue-400">Available Integrations</h2>
                        <p>
                          The platform supports integration with various security tools and services to extend
                          its capabilities and provide a unified security operations experience.
                        </p>
                      </section>

                      <section className="space-y-2">
                        <h2 className="text-xl font-semibold text-blue-400">Splunk Integration</h2>
                        <p>
                          The Threat Hunter Pro integration with Splunk provides advanced SIEM capabilities:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Real-time log ingestion and analysis</li>
                          <li>Custom dashboards for security monitoring</li>
                          <li>Threat hunting with Splunk Search Processing Language (SPL)</li>
                          <li>Correlation of security events across multiple sources</li>
                          <li>Automated alerting based on custom detection rules</li>
                        </ul>
                        <div className="mt-2">
                          <Button variant="outline" size="sm" className="flex items-center">
                            <Database className="mr-1 h-4 w-4" />
                            Configure Splunk
                          </Button>
                        </div>
                      </section>

                      <section className="space-y-2 mt-4">
                        <h2 className="text-xl font-semibold text-blue-400">Other Integrations</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="bg-gray-700 border-gray-600">
                            <CardContent className="p-4">
                              <h3 className="font-semibold mb-1">Active Directory</h3>
                              <p className="text-sm text-gray-300">Connect to your organization's Active Directory for user authentication and management.</p>
                            </CardContent>
                          </Card>
                          <Card className="bg-gray-700 border-gray-600">
                            <CardContent className="p-4">
                              <h3 className="font-semibold mb-1">JIRA</h3>
                              <p className="text-sm text-gray-300">Create and track security incidents in JIRA directly from the platform.</p>
                            </CardContent>
                          </Card>
                          <Card className="bg-gray-700 border-gray-600">
                            <CardContent className="p-4">
                              <h3 className="font-semibold mb-1">Slack</h3>
                              <p className="text-sm text-gray-300">Receive alerts and notifications in designated Slack channels.</p>
                            </CardContent>
                          </Card>
                          <Card className="bg-gray-700 border-gray-600">
                            <CardContent className="p-4">
                              <h3 className="font-semibold mb-1">Email</h3>
                              <p className="text-sm text-gray-300">Send automated reports and alerts via email to security team members.</p>
                            </CardContent>
                          </Card>
                        </div>
                      </section>
                    </>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentationPage;
