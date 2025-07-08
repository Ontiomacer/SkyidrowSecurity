import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, X, Minimize2, Maximize2, Mic, MicOff, Send, Bot, User, 
  Shield, Lightbulb, Search, Key, Lock, ShieldCheck, AlertTriangle, Scan, 
  Terminal, Database, FileText, ExternalLink, Zap, Settings, HelpCircle, 
  List, Code, Wifi, HardDrive, Server, Clock, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

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
      'IOC analysis',
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
      'CI/CD integration'
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

// Command suggestions for quick actions
const QUICK_COMMANDS = [
  { command: 'Scan a target', description: 'Start a new security scan', icon: <Scan className="w-4 h-4" /> },
  { command: 'Show API keys', description: 'View and manage API keys', icon: <Key className="w-4 h-4" /> },
  { command: 'View reports', description: 'Access scan reports', icon: <FileText className="w-4 h-4" /> },
  { command: 'Check status', description: 'View system status', icon: <Server className="w-4 h-4" /> },
];

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'command';
  content: string | JSX.Element;
  timestamp: Date;
  suggestions?: string[];
  isProcessing?: boolean;
}

interface NovaAssistantProps {
  onMinimize?: () => void;
  onClose?: () => void;
  initialMessage?: string;
}

const NovaAssistant: React.FC<NovaAssistantProps> = ({ 
  onMinimize, 
  onClose,
  initialMessage 
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      addAssistantMessage(
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold">Welcome to Nova AI Assistant</h3>
          </div>
          <p>I'm here to help you with:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Security scanning and analysis</li>
            <li>Threat intelligence</li>
            <li>API key management</li>
            <li>Report generation</li>
          </ul>
          <p>How can I assist you today?</p>
        </div>,
        ["Scan a target", "Show API keys", "View reports"]
      );
    }
  }, [messages.length]);

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
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition error:', error);
        toast({
          title: "Microphone Access Required",
          description: "Please allow microphone access to use voice input.",
          variant: "destructive"
        });
      }
    }
  };

  const addAssistantMessage = (content: string | JSX.Element, suggestions: string[] = []) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content,
      timestamp: new Date(),
      suggestions
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const processCommand = useCallback((command: string) => {
    const normalizedCommand = command.toLowerCase().trim();
    
    // Navigation commands
    if (normalizedCommand.includes('dashboard') || normalizedCommand.includes('home')) {
      navigate('/dashboard');
      return { content: 'Navigating to Dashboard...' };
    } 
    if (normalizedCommand.includes('settings') || normalizedCommand.includes('api keys')) {
      navigate('/settings');
      return { content: 'Opening Settings page...' };
    } 
    if (normalizedCommand.includes('scan') || normalizedCommand.includes('new scan')) {
      navigate('/simulation/new');
      return { content: 'Starting a new security scan...' };
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
    
    // Default response
    return { 
      content: `I'm not sure how to respond to "${command}". Here are some things I can help with:`,
      suggestions: ['Show Features', 'Start a Scan', 'View API Docs']
    };
  }, [navigate]);

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
      
      // Simulate typing delay
      setTimeout(() => {
        addAssistantMessage(
          response.content,
          response.suggestions
        );
        setIsTyping(false);
      }, 800);
    } catch (error) {
      console.error('Error processing message:', error);
      addAssistantMessage(
        'Sorry, I encountered an error processing your request. Please try again.',
        ['Try Again', 'Contact Support']
      );
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    // Auto-send if it's a command suggestion
    if (suggestion.startsWith('/')) {
      handleSendMessage();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (onMinimize) onMinimize();
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
          aria-label="Open Nova Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-gray-900 rounded-lg shadow-xl border border-gray-700 flex flex-col z-50">
      <div className="bg-gray-800 px-4 py-3 rounded-t-lg flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <h3 className="font-medium text-white">Nova AI Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleMinimize}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
            aria-label="Minimize"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4 space-y-4 max-h-96">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`rounded-lg px-4 py-2 max-w-[80%] ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              }`}
            >
              {typeof message.content === 'string' ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                message.content
              )}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>

      <div className="p-3 border-t border-gray-700">
        <div className="relative">
          <Input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="pr-12 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            <button
              onClick={toggleVoiceInput}
              className={`p-1 rounded-full ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-white'}`}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="p-1 text-blue-400 hover:text-blue-300 disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK_COMMANDS.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(cmd.command)}
              className="text-xs flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-200 px-2 py-1 rounded border border-gray-700"
            >
              {cmd.icon}
              <span>{cmd.command}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NovaAssistant;
