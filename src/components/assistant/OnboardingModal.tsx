
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  AlertTriangle,
  Search,
  Play,
  Database,
  Terminal,
  Lightbulb,
  Target
} from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  tips: string[];
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps: OnboardingStep[] = [
    {
      id: 0,
      title: "Welcome to Skyidrow Security Intelligence",
      description: "Your AI-powered cybersecurity command center",
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      content: (
        <div className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold">Meet Nova, Your AI Security Assistant</h3>
          <p className="text-gray-600">
            I'm here to help you navigate our platform, understand your security posture, 
            and guide you through threat analysis. Think of me as your personal cybersecurity expert!
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <Lightbulb className="h-4 w-4 inline mr-2" />
              I can assist with voice or text commands, provide contextual tips, and explain complex security data in simple terms.
            </p>
          </div>
        </div>
      ),
      tips: [
        "I'm available 24/7 via the chat widget",
        "Use voice commands for hands-free assistance",
        "Ask me to explain any security metrics you see"
      ]
    },
    {
      id: 1,
      title: "Your Security Dashboard",
      description: "Real-time threat intelligence at a glance",
      icon: <Search className="h-8 w-8 text-green-600" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-800">Active Threats</span>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600 mt-1">24</div>
              <div className="text-xs text-red-600 mt-1">+3 today</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-800">Vulnerabilities</span>
                <Target className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-amber-600 mt-1">16</div>
              <div className="text-xs text-amber-600 mt-1">Medium risk</div>
            </div>
          </div>
          <p className="text-gray-600">
            Your dashboard provides real-time visibility into your security posture. 
            The AI continuously monitors and analyzes threats, giving you actionable insights.
          </p>
        </div>
      ),
      tips: [
        "Click any metric to see detailed analysis",
        "Threat severity is color-coded for quick identification",
        "Ask me to explain what any number means"
      ]
    },
    {
      id: 2,
      title: "Threat Simulation Center",
      description: "Test your defenses proactively",
      icon: <Play className="h-8 w-8 text-purple-600" />,
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">Phishing Simulator</h4>
            <p className="text-sm text-purple-700 mb-3">
              Create realistic phishing campaigns to test employee awareness and improve security culture.
            </p>
            <Badge className="bg-purple-600 text-white">87% Improvement Rate</Badge>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Vulnerability Scanner</h4>
            <p className="text-sm text-blue-700 mb-3">
              Automated scanning detects weaknesses before attackers do.
            </p>
            <Badge className="bg-blue-600 text-white">Daily Automated Scans</Badge>
          </div>
        </div>
      ),
      tips: [
        "Run simulations regularly to maintain security awareness",
        "Use AI-generated phishing templates for realistic tests",
        "Schedule automatic vulnerability scans"
      ]
    },
    {
      id: 3,
      title: "ThreatHunter Pro Analytics",
      description: "Advanced threat correlation and hunting",
      icon: <Database className="h-8 w-8 text-indigo-600" />,
      content: (
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-indigo-800 mb-2">IOC Correlation Engine</h4>
            <p className="text-sm text-indigo-700 mb-3">
              Our AI correlates Indicators of Compromise from multiple threat feeds to identify advanced persistent threats.
            </p>
            <div className="flex space-x-2">
              <Badge variant="outline" className="text-indigo-600 border-indigo-300">VirusTotal</Badge>
              <Badge variant="outline" className="text-indigo-600 border-indigo-300">MISP</Badge>
              <Badge variant="outline" className="text-indigo-600 border-indigo-300">Internal</Badge>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Use natural language queries to hunt for threats: "Show me all suspicious IP addresses from the last 24 hours"
          </p>
        </div>
      ),
      tips: [
        "Use natural language for threat hunting queries",
        "Correlate IOCs across multiple threat intelligence feeds",
        "Export findings for incident response workflows"
      ]
    },
    {
      id: 4,
      title: "Secure Terminal Environment",
      description: "Command-line tools for security professionals",
      icon: <Terminal className="h-8 w-8 text-gray-700" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <div className="flex items-center mb-2">
              <span className="text-blue-400">nova@skyidrow:~$</span>
              <span className="ml-2 animate-pulse">█</span>
            </div>
            <div className="space-y-1 text-xs">
              <div>• nmap -sn 192.168.1.0/24 - Network discovery</div>
              <div>• ssh analyst@threat-hunter - Remote access</div>
              <div>• ai-assist - Get intelligent command suggestions</div>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Full-featured terminal with SSH capabilities, network tools, and AI-powered command assistance.
          </p>
        </div>
      ),
      tips: [
        "Type 'help' to see all available commands",
        "Use 'ai-assist' for intelligent command suggestions",
        "SSH into remote systems for deep investigation"
      ]
    }
  ];

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps([...completedSteps, currentStep]);
    onComplete();
    onClose();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              {steps[currentStep].icon}
              <span>{steps[currentStep].title}</span>
            </DialogTitle>
            <Badge variant="outline" className="text-xs">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="w-full h-2 mt-2" />
        </DialogHeader>

        <div className="py-6">
          <p className="text-gray-600 mb-6">{steps[currentStep].description}</p>
          
          {steps[currentStep].content}

          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Pro Tips
            </h4>
            <ul className="space-y-1">
              {steps[currentStep].tips.map((tip, index) => (
                <li key={index} className="text-sm text-blue-700 flex items-start">
                  <CheckCircle className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-blue-600'
                    : completedSteps.includes(index)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
