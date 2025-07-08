import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Maximize2, 
  Mic, 
  MicOff, 
  Send,
  Bot,
  User,
  Shield,
  Lightbulb,
  Navigation,
  Search,
  Download,
  ExternalLink,
  Key,
  Lock,
  ShieldCheck,
  Network,
  Code,
  Settings,
  AlertTriangle,
  Scan,
  Terminal,
  Database,
  HardDrive,
  FileText,
  FileSearch
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { automatedOSINTService } from '@/services/AutomatedOSINTService';

// Add TypeScript declaration for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// Feature categories for the assistant
const FEATURE_CATEGORIES = [
  {
    name: 'Security Scanning',
    icon: <ShieldCheck className="w-4 h-4" />,
    features: [
      'Port scanning',
      'Vulnerability assessment',
      'Web application scanning',
      'Network mapping'
    ]
  },
  {
    name: 'Threat Intelligence',
    icon: <AlertTriangle className="w-4 h-4" />,
    features: [
      'Threat feed monitoring',
      'IOC (Indicators of Compromise) analysis',
      'Threat hunting',
      'Malware analysis'
    ]
  },
  {
    name: 'API Management',
    icon: <Key className="w-4 h-4" />,
    features: [
      'API key generation',
      'Access control',
      'Usage analytics',
      'Rate limiting'
    ]
  },
  {
    name: 'Automation',
    icon: <Terminal className="w-4 h-4" />,
    features: [
      'Automated scanning',
      'Scheduled tasks',
      'Custom workflows',
      'Integration with CI/CD'
    ]
  },
  {
    name: 'Data Management',
    icon: <Database className="w-4 h-4" />,
    features: [
      'Scan result storage',
      'Data export',
      'Report generation',
      'Evidence collection'
    ]
  },
  {
    name: 'Reporting',
    icon: <FileText className="w-4 h-4" />,
    features: [
      'Executive summaries',
      'Technical reports',
      'Compliance reports',
      'Custom templates'
    ]
  }
];

interface MessageMetadata {
  type?: 'feature' | 'tutorial' | 'command' | 'result';
  data?: any;
}

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'command';
  content: string | JSX.Element;
  timestamp: Date;
  suggestions?: string[];
  isProcessing?: boolean;
  metadata?: MessageMetadata;
}

interface AIAssistantWidgetProps {
  onOnboardingStart?: () => void;
  isFirstVisit?: boolean;
}

const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({ 
  onOnboardingStart, 
  isFirstVisit = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Check if speech recognition is available
  const isSpeechRecognitionAvailable = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  // Initialize with welcome message and feature overview
  useEffect(() => {
    if (isFirstVisit && messages.length === 0) {
      setTimeout(() => {
        addAssistantMessage(
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold">Welcome to Skyidrow Security Intelligence!</h3>
            </div>
            <p>I'm Nova, your AI cybersecurity assistant. I'm here to help you:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Navigate the platform's features</li>
              <li>Conduct security assessments</li>
              <li>Analyze threats and vulnerabilities</li>
              <li>Manage API keys and integrations</li>
              <li>Generate detailed reports</li>
            </ul>
            <p>How can I assist you today?</p>
          </div>,
          ["Start Tour", "Show Features", "Scan a Target"]
        );
      }, 1000);
    }
  }, [isFirstVisit, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Unable to process voice input. Please try again.",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const addAssistantMessage = (content: string | JSX.Element, suggestions: string[] = [], isProcessing = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content,
      timestamp: new Date(),
      suggestions,
      isProcessing
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const updateLastMessage = (content: string | JSX.Element, suggestions: string[] = []) => {
    setMessages(prev => prev.map((msg, index) => 
      index === prev.length - 1 ? { ...msg, content, suggestions, isProcessing: false } : msg
    ));
  };

  // Process natural language commands
  const processCommand = useCallback((command: string) => {
    const normalizedCommand = command.toLowerCase().trim();
    let response: { content: string | JSX.Element; suggestions?: string[] } = {
      content: `I'm not sure how to respond to "${command}". Here are some things I can help with:`,
      suggestions: ['Show Features', 'Start a Scan', 'View API Docs']
    };
    
    // Navigation commands
    if (normalizedCommand.includes('dashboard') || normalizedCommand.includes('home')) {
      navigate('/dashboard');
      response = { 
        content: 'Navigating to Dashboard...',
        suggestions: ['Show Dashboard Features', 'Run Quick Scan', 'View Reports']
      };
    } else if (normalizedCommand.includes('settings') || normalizedCommand.includes('api keys')) {
      navigate('/settings');
      response = { 
        content: 'Opening Settings page...',
        suggestions: ['Manage API Keys', 'Configure Notifications', 'User Preferences']
      };
    } else if (normalizedCommand.includes('scan') || normalizedCommand.includes('new scan')) {
      navigate('/simulation/new');
      response = { 
        content: 'Starting a new security scan...',
        suggestions: ['Quick Scan', 'Full Scan', 'Custom Scan']
      };
    }
    
    // Feature explanations
    if (normalizedCommand.includes('feature') || normalizedCommand.includes('what can you do')) {
      return {
        content: (
          <div className="space-y-4">
            <h3 className="font-semibold">Platform Features:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FEATURE_CATEGORIES.map((category, idx) => (
                <div key={idx} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 text-blue-300 mb-2">
                    {category.icon}
                    <h4 className="font-medium">{category.name}</h4>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {category.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )
      };
    }
    
    // API Key management
    if (normalizedCommand.includes('api key') || normalizedCommand.includes('api keys')) {
      if (normalizedCommand.includes('add') || normalizedCommand.includes('create')) {
        return { 
          content: 'To add a new API key, go to Settings > API Keys and click "Add API Key".',
          suggestions: ['Go to API Keys', 'How to use API keys?']
        };
      }
      return { 
        content: 'You can manage your API keys in the Settings > API Keys section.',
        suggestions: ['Show API Keys', 'Add New API Key']
      };
    }
    
    return response;
  }, [navigate]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Process the command and get response
      const response = processCommand(inputText);
      
      // Toggle the assistant
  const toggleAssistant = useCallback(() => {
    if (isMinimized) {
      setIsMinimized(false);
    } else if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  }, [isMinimized, isOpen]);
  
  // Handle voice input
  const toggleVoiceInput = useCallback(() => {
    if (!isSpeechRecognitionAvailable) {
      toast({
        title: 'Speech Recognition Not Available',
        description: 'Your browser does not support speech recognition.',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
        toast({
          title: 'Microphone Access Error',
          description: 'Please allow microphone access to use voice input.',
          variant: 'destructive',
        });
      }
    }
  }, [isListening, isSpeechRecognitionAvailable]);
    } catch (error) {
      console.error('Error processing message:', error);
      addAssistantMessage(
        'Sorry, I encountered an error processing your request. Please try again.',
        ['Try Again', 'Contact Support']
{{ ... }}
      );
      setIsTyping(false);
    }
      // Generic helpful response
      addAssistantMessage(
        "I understand you're looking for assistance! I can help you navigate our security platform, explain threat data, run automated OSINT scans, or analyze security events. What specific area interests you most?",
        ["Security Overview", "Run OSINT Scan", "Threat Analysis", "Platform Tour"]
      );
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Handle special navigation suggestions
    if (suggestion === "Go to OSINT Page" || suggestion === "View OSINT Tools" || suggestion === "OSINT Tools") {
      navigate('/osint');
      addAssistantMessage(
        "🔍 **Welcome to the OSINT Intelligence Center!** \n\nHere you can access all our threat intelligence tools. I can also run automated scans for you - just ask me to analyze any IP, domain, URL, or perform Google dorking queries!",
        ["Scan 8.8.8.8", "Analyze google.com", "Google Dork Search", "View Analytics"]
      );
      return;
    }

    if (suggestion === "View Full Details") {
      navigate('/osint');
      addAssistantMessage(
        "📊 **Redirecting to Full OSINT Dashboard** \n\nYou can view detailed results, download data in multiple formats, and access advanced analytics on the OSINT page.",
        ["Run Another Scan", "Download Data", "View Analytics"]
      );
      return;
    }

    // Handle download suggestions
    if (suggestion.includes("Download")) {
      const format = suggestion.includes("CSV") ? "csv" : suggestion.includes("TXT") ? "txt" : "json";
      handleSuggestionClick(`download results as ${format}`);
      return;
    }

    // Regular suggestion handling
    addUserMessage(suggestion);
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      handleAIResponse(suggestion);
    }, 800);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  // Context-aware tips based on current page
  useEffect(() => {
    if (!isOpen) return;

    const path = location.pathname;
    let contextMessage = "";
    
    switch (path) {
      case '/':
        contextMessage = "💡 Tip: Your dashboard shows 24 active threats. Click on any metric card to dive deeper into the data!";
        break;
      case '/simulations':
        contextMessage = "🎯 Tip: Regular phishing simulations improve employee awareness by up to 70%. Try our AI-powered campaign builder!";
        break;
      case '/splunk':
        contextMessage = "🔍 Tip: Use the IOC Correlation tab to find related indicators and build a complete threat picture!";
        break;
      case '/terminal':
        contextMessage = "⚡ Tip: Try 'nmap -sn 192.168.1.0/24' to discover devices on your network, or 'ai-assist' for intelligent command suggestions!";
        break;
    }

    if (contextMessage && messages.length > 0) {
      setTimeout(() => {
        addAssistantMessage(contextMessage);
      }, 3000);
    }
  }, [location.pathname, isOpen]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
          size="icon"
        >
          <Bot className="h-6 w-6 text-white" />
        </Button>
        {isFirstVisit && (
          <div className="absolute -top-12 -left-32 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm animate-bounce">
            👋 Hi! I'm Nova, your AI guide!
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'}`}>
      <Card className="h-full bg-white/95 backdrop-blur-sm border border-gray-200 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold">Nova AI Assistant</h3>
              <Badge variant="outline" className="text-xs border-white/30 text-white/90">
                OSINT Automation Ready
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 hover:bg-white/20 text-white"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 hover:bg-white/20 text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg p-3`}>
                      <div className="flex items-start space-x-2">
                        {message.type === 'assistant' && (
                          <Shield className="h-4 w-4 mt-0.5 text-blue-600" />
                        )}
                        <div className="flex-1">
                          <div className="text-sm whitespace-pre-line">{message.content}</div>
                          {message.isProcessing && (
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-xs text-gray-600">Processing...</span>
                            </div>
                          )}
                          {message.suggestions && message.suggestions.length > 0 && !message.isProcessing && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="xs"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="h-6 text-xs flex items-center gap-1"
                                >
                                  {suggestion.includes("Download") && <Download className="h-3 w-3" />}
                                  {suggestion.includes("OSINT") && <Search className="h-3 w-3" />}
                                  {suggestion.includes("Go to") && <ExternalLink className="h-3 w-3" />}
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me to scan IPs, domains, or run OSINT analysis..."
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={isListening ? () => {} : () => {}}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 ${isListening ? 'text-red-500' : 'text-gray-400'}`}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </div>
                <Button onClick={handleSendMessage} size="icon" className="h-10 w-10">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {isListening && (
                <div className="text-xs text-red-500 mt-1 animate-pulse">
                  🎤 Listening... Speak now
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                💡 Try: "Scan 8.8.8.8 with VirusTotal" or "Google dork site:example.com"
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AIAssistantWidget;
