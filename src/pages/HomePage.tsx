import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

import AIAssistantWidget from '@/components/assistant/AIAssistantWidget';
import OnboardingModal from '@/components/assistant/OnboardingModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertCircle, Search, Play, Database, FileText, Shield, Activity, TrendingUp, Users, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { securityMetrics, recentThreats, activeVulnerabilities } from '@/data/cyberSecurityData';

const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const navigate = useNavigate();
  
  // Check if this is the user's first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('skyidrow-visited');
    if (!hasVisited) {
      setIsFirstVisit(true);
      setShowOnboarding(true);
      localStorage.setItem('skyidrow-visited', 'true');
    }
  }, []);
  
  const handleNewScan = () => {
    toast({
      title: "Nova AI: Vulnerability Scan Initiated",
      description: "Starting comprehensive network security assessment. I'll monitor progress and alert you of any critical findings.",
    });
    
    window.dispatchEvent(new CustomEvent('start-vulnerability-scan'));
  };
  
  const handleLaunchPhishingSimulator = () => {
    toast({
      title: "Nova AI: Opening Phishing Simulator",
      description: "Let me guide you through creating an effective security awareness campaign."
    });
    navigate('/simulations');
  };
  
  const handleStartVulnerabilityScan = () => {
    toast({
      title: "Nova AI: Vulnerability Assessment Started",
      description: "Scanning 42 monitored systems for security weaknesses. Real-time results will appear in the terminal.",
    });
    window.dispatchEvent(new CustomEvent('start-vulnerability-scan'));
  };
  
  const handleConfigureSplunk = () => {
    toast({
      title: "Nova AI: Opening ThreatHunter Pro",
      description: "Access advanced threat correlation and hunting capabilities."
    });
    navigate('/splunk');
  };
  

  const handleOnboardingComplete = () => {
    toast({
      title: "Welcome aboard! 🎉",
      description: "Nova AI is ready to assist you. Click the chat widget anytime for help!"
    });
  };
  
  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        {/* Enhanced Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Security Operations Center
            </h1>
            <p className="text-muted-foreground flex items-center mt-1">
              <Shield className="h-4 w-4 mr-2 text-blue-600" />
              AI-powered threat intelligence platform • Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setShowOnboarding(true)}
              className="flex items-center bg-white text-gray-900 hover:bg-gray-100 border border-gray-300"
            >
              <Play className="mr-1 h-4 w-4" />
              Take Tour
            </Button>
            <Link to="/documentation">
              <Button variant="secondary" size="sm" className="flex items-center bg-white text-gray-900 hover:bg-gray-100 border border-gray-300">
                <FileText className="mr-1 h-4 w-4" />
                Documentation
              </Button>
            </Link>
            <Button size="sm" onClick={handleNewScan} variant="gradient">
              Nova AI Scan
            </Button>
          </div>
        </div>
        
        {/* Enhanced Security Summary with Real Data */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Main Security Summary Card */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 shadow-xl text-white">
              <CardHeader className="border-b border-gray-700 pb-3">
                <CardTitle className="flex items-center text-xl">
                  <Shield className="h-5 w-5 text-blue-400 mr-2" />
                  Threat Intelligence Summary
                  <Badge className="ml-2 bg-blue-600 animate-pulse">Live</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-900/30 p-4 rounded-lg border border-red-800/50">
                    <h3 className="text-sm font-medium text-red-300">Active Threats</h3>
                    <div className="flex items-baseline">
                      <p className="text-3xl font-bold text-red-400">{securityMetrics.totalThreats}</p>
                      <span className="text-xs ml-1 text-red-300">+3 today</span>
                    </div>
                    <div className="text-xs text-red-300 mt-1">
                      {recentThreats.filter(t => t.severity === 'critical').length} Critical • {recentThreats.filter(t => t.severity === 'high').length} High
                    </div>
                  </div>
                  <div className="bg-amber-900/30 p-4 rounded-lg border border-amber-800/50">
                    <h3 className="text-sm font-medium text-amber-300">Vulnerabilities</h3>
                    <div className="flex items-baseline">
                      <p className="text-3xl font-bold text-amber-400">{Object.values(securityMetrics.vulnerabilities).reduce((a, b) => a + b, 0)}</p>
                      <span className="text-xs ml-1 text-amber-300">Medium risk</span>
                    </div>
                    <div className="text-xs text-amber-300 mt-1">
                      {securityMetrics.vulnerabilities.critical} Critical • {securityMetrics.vulnerabilities.high} High
                    </div>
                  </div>
                  <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800/50">
                    <h3 className="text-sm font-medium text-blue-300">Systems Monitored</h3>
                    <div className="flex items-baseline">
                      <p className="text-3xl font-bold text-blue-400">{securityMetrics.networkHealth.monitoredSystems}</p>
                      <span className="text-xs ml-1 text-blue-300">All active</span>
                    </div>
                    <div className="text-xs text-blue-300 mt-1">
                      {securityMetrics.networkHealth.uptimePercentage}% Uptime
                    </div>
                  </div>
                  <div className="bg-green-900/30 p-4 rounded-lg border border-green-800/50">
                    <h3 className="text-sm font-medium text-green-300">Security Score</h3>
                    <div className="flex items-baseline">
                      <p className="text-3xl font-bold text-green-400">{securityMetrics.securityScore}%</p>
                      <span className="text-xs ml-1 text-green-300">Good</span>
                    </div>
                    <Progress value={securityMetrics.securityScore} className="mt-2 h-1" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-700 pt-3">
                <Link to="/analysis" className="w-full">
                  <Button variant="gradient" className="w-full">
                    <Activity className="mr-1 h-4 w-4" />
                    View Full Analysis Dashboard
                  </Button>
                </Link>
              </CardFooter>
          </Card>
          
          {/* Recent Threats */}
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg text-white">
                  <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                  Recent Threats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentThreats.slice(0, 3).map((threat) => (
                  <div key={threat.id} className="bg-gray-700 p-3 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <Badge className={
                        threat.severity === 'critical' ? 'bg-red-500' :
                        threat.severity === 'high' ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }>
                        {threat.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-400">{threat.id}</span>
                    </div>
                    <p className="text-sm text-gray-200 font-medium capitalize">{threat.type.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{threat.description}</p>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Link to="/analysis" className="w-full">
                  <Button variant="outline" className="w-full text-xs">
                    View All Threats
                  </Button>
                </Link>
              </CardFooter>
          </Card>
          
          {/* Performance Metrics */}
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg text-white">
                  <TrendingUp className="h-4 w-4 text-blue-400 mr-2" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Detection Time</span>
                    <span className="text-sm font-medium text-green-400">{securityMetrics.meanTimeToDetection}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Response Time</span>
                    <span className="text-sm font-medium text-blue-400">{securityMetrics.meanTimeToResponse}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">False Positives</span>
                    <span className="text-sm font-medium text-orange-400">{securityMetrics.networkHealth.falsePositiveRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Cases Resolved</span>
                    <span className="text-sm font-medium text-green-400">{securityMetrics.resolvedToday} today</span>
                  </div>
                </div>
              </CardContent>
          </Card>
        </div>

        {/* Enhanced Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700 shadow-lg text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-4 w-4 text-purple-300 mr-2" />
                  Attack Simulation (Nmap)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-purple-100">Simulate real-world network reconnaissance using Nmap to test your infrastructure's exposure and detection capabilities.</p>
                <div className="flex items-center space-x-2 text-xs text-purple-200">
                  <Clock className="h-3 w-3" />
                  <span>Last scan: 12 open ports detected</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="gradient" 
                  className="w-full bg-white/20 hover:bg-white/30 border-0"
                  onClick={handleLaunchPhishingSimulator}
                >
                  Run Nmap Simulation
                </Button>
              </CardFooter>
          </Card>
          
          {/* News Highlights Card (replicates /news features) */}
          <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 shadow-lg text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <AlertCircle className="h-4 w-4 text-blue-300 mr-2" />
                  Cybersecurity News Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-blue-100">Stay updated with the latest cybersecurity news, threat intelligence, and global incidents. Filter by tags, severity, or search for specific topics.</p>
                <div className="flex flex-col space-y-1 text-xs text-blue-200">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-3 w-3" />
                    <span>Live threat news aggregation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Search className="h-3 w-3" />
                    <span>Search, filter, and bookmark articles</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3" />
                    <span>Updated hourly from multiple sources</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="gradient" 
                  className="w-full bg-white/20 hover:bg-white/30 border-0"
                  onClick={() => navigate('/news')}
                >
                  View News Feed
                </Button>
              </CardFooter>
          </Card>
          
          <Card className="bg-gradient-to-br from-indigo-900 to-indigo-800 border-indigo-700 shadow-lg text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Database className="h-4 w-4 text-indigo-300 mr-2" />
                  ThreatHunter Pro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-indigo-100">Advanced threat correlation and hunting with AI insights</p>
                <div className="flex items-center space-x-2 text-xs text-indigo-200">
                  <Search className="h-3 w-3" />
                  <span>247 IOCs correlated</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="gradient" 
                  className="w-full bg-white/20 hover:bg-white/30 border-0"
                  onClick={handleConfigureSplunk}
                >
                  Open Analytics
                </Button>
              </CardFooter>
          </Card>
        </div>

        {/* AI Assistant Widget */}
        <AIAssistantWidget 
          onOnboardingStart={() => setShowOnboarding(true)}
          isFirstVisit={isFirstVisit}
        />

        {/* Onboarding Modal */}
        <OnboardingModal 
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={handleOnboardingComplete}
        />
      </div>
    </Layout>
  );
};

export default HomePage;
