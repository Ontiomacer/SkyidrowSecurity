import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';

// Import icons from lucide-react
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

// Type definitions for speech recognition
declare global {
  interface SpeechRecognitionEvent extends Event {
    results: {
      [index: number]: {
        [index: number]: {
          transcript: string;
        };
      };
    };
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    onnomatch: () => void;
    onsoundstart: () => void;
    onsoundend: () => void;
    onspeechend: () => void;
    onstart: () => void;
  }

  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
      prototype: SpeechRecognition;
    } | undefined;
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
      prototype: SpeechRecognition;
    } | undefined;
  }
}

// Type definitions
type MessageType = 'user' | 'assistant' | 'system' | 'command';
type FeatureType = 'feature' | 'tutorial' | 'command' | 'result';

interface MessageMetadata {
  type?: FeatureType;
  data?: unknown;
}

interface Message {
  id: string;
  type: MessageType;
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



// Feature categories for the assistant
const FEATURE_CATEGORIES = [
  {
    id: 'threat-intel',
    name: 'Threat Intelligence',
    description: 'Access the latest threat intelligence and indicators of compromise',
    icon: <ShieldCheck className="w-5 h-5" />,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'vulnerability-scanning',
    name: 'Vulnerability Scanning',
    description: 'Scan for vulnerabilities in your infrastructure',
    icon: <Scan className="w-5 h-5" />,
    color: 'bg-red-100 text-red-600',
  },
  {
    id: 'network-analysis',
    name: 'Network Analysis',
    description: 'Analyze network traffic and detect anomalies',
    icon: <Network className="w-5 h-5" />,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'api-integration',
    name: 'API Integration',
    description: 'Integrate with external security tools and APIs',
    icon: <Code className="w-5 h-5" />,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'reporting',
    name: 'Reporting',
    description: 'Generate detailed security reports',
    icon: <FileText className="w-5 h-5" />,
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Configure application settings',
    icon: <Settings className="w-5 h-5" />,
    color: 'bg-gray-100 text-gray-600',
  },
];

const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({
  onOnboardingStart,
  isFirstVisit = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSpeechRecognitionAvailable = 
    typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  // Initialize speech recognition
  useEffect(() => {
    if (isSpeechRecognitionAvailable) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event);
        setIsListening(false);
        toast({
          title: 'Speech Recognition Error',
          description: 'Could not process voice input. Please try again.',
          variant: 'destructive',
        });
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSpeechRecognitionAvailable]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when widget is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Add a new message to the chat
  const addMessage = useCallback((
    content: string | JSX.Element, 
    type: MessageType = 'assistant',
    suggestions?: string[],
    metadata?: MessageMetadata
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      suggestions,
      metadata,
    };
    
    setMessages(prev => [...prev, newMessage]);
  }, []);

  // Process user input and generate response
  const processCommand = useCallback((command: string) => {
    const normalizedCommand = command.toLowerCase().trim();
    let response: { content: string | JSX.Element; suggestions?: string[] } = {
      content: `I'm not sure how to help with "${command}". Here are some things I can do:`,
      suggestions: ['Show Features', 'Start a Scan', 'View API Docs']
    };
    
    // Helper function to navigate and show a message
    const navigateWithMessage = (path: string, message: string) => {
      // Only navigate if not already on the target path
      if (location.pathname + location.search !== path) {
        navigate(path);
      }
      return message;
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
    } else if (normalizedCommand.includes('quick scan')) {
      response = {
        content: navigateWithMessage(
          '/simulations?type=quick',
          'Starting a quick security scan. This will check for common vulnerabilities.'
        ),
        suggestions: ['View Scan Progress', 'View Previous Scans', 'Run Full Scan']
      };
    } else if (normalizedCommand.includes('full scan')) {
      response = {
        content: navigateWithMessage(
          '/simulations?type=full',
          'Starting a comprehensive security scan. This may take some time to complete.'
        ),
        suggestions: ['View Scan Progress', 'View Previous Scans', 'Run Quick Scan']
      };
    } else if (normalizedCommand.includes('custom scan')) {
      response = {
        content: navigateWithMessage(
          '/simulations/new',
          'Taking you to the custom scan configuration page.'
        ),
        suggestions: ['Quick Scan', 'Full Scan', 'View Scan Templates']
      };
    } else if (
      normalizedCommand.includes('scan') || 
      normalizedCommand.includes('start scan') ||
      normalizedCommand.includes('run scan') ||
      normalizedCommand.includes('new scan') ||
      normalizedCommand.includes('start a scan')
    ) {
      // General scan command
      response = { 
        content: (
          <div className="space-y-2">
            <p>I can help you start a security scan. What type of scan would you like to run?</p>
            <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
              <p className="font-medium text-blue-800">Available Scan Types:</p>
              <ul className="mt-1 space-y-1 text-sm text-blue-700">
                <li>• <button onClick={() => handleSuggestionClick('Quick Scan')} className="font-medium hover:underline">Quick Scan</button>: Fast scan for common vulnerabilities</li>
                <li>• <button onClick={() => handleSuggestionClick('Full Scan')} className="font-medium hover:underline">Full Scan</button>: Comprehensive scan of all systems</li>
                <li>• <button onClick={() => handleSuggestionClick('Custom Scan')} className="font-medium hover:underline">Custom Scan</button>: Configure your own scan parameters</li>
              </ul>
            </div>
          </div>
        ),
        suggestions: ['Quick Scan', 'Full Scan', 'Custom Scan']
      };
    } else if (normalizedCommand.includes('features') || normalizedCommand.includes('what can you do')) {
      response = {
        content: (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Here's what I can help you with:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FEATURE_CATEGORIES.map((feature) => (
                <div 
                  key={feature.id}
                  className="p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-full ${feature.color}`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{feature.name}</h4>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
        suggestions: ['Start a Scan', 'View Reports', 'API Documentation']
      };
    }
    
    return response;
  }, [navigate]);

  // Handle sending a message
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) return;
    
    // Add user message
    addMessage(inputText, 'user');
    setInputText('');
    setIsTyping(true);
    
    try {
      // Process the command and get response
      const response = processCommand(inputText);
      
      // Simulate typing delay
      setTimeout(() => {
        addMessage(response.content, 'assistant', response.suggestions);
        setIsTyping(false);
      }, 800);
    } catch (error) {
      console.error('Error processing message:', error);
      addMessage(
        'Sorry, I encountered an error processing your request. Please try again.',
        'assistant',
        ['Try Again', 'Contact Support']
      );
      setIsTyping(false);
    }
  }, [inputText, addMessage, processCommand]);

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



  const isMounted = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error cleaning up speech recognition:', e);
        }
      }
    };
  }, []);
  
  // Toggle the assistant
  const toggleAssistant = useCallback((e: React.MouseEvent) => {
    try {
      // Always prevent default and stop propagation
      e.preventDefault();
      e.stopPropagation();
      
      // Use the native event's stopImmediatePropagation if available
      if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
        e.nativeEvent.stopImmediatePropagation();
      }
      
      setIsOpen(prev => !prev);
      if (isMinimized) {
        setIsMinimized(false);
      }
    } catch (error) {
      console.error('Error in toggleAssistant:', error);
    }
  }, [isMinimized]);

  // Add welcome message on first render
  useEffect(() => {
    if (isFirstVisit) {
      addMessage(
        'Welcome to Skyidrow Security Assistant! I can help you with:',
        'assistant',
        ['Start a Security Scan', 'View Dashboard', 'Check Reports']
      );
    }
  }, [isFirstVisit, addMessage]);
  
  // Handle suggestion clicks
  const handleSuggestionClick = useCallback((suggestion: string) => {
    // If suggestion is a scan-related command, process it directly
    if (suggestion.toLowerCase().includes('scan')) {
      const response = processCommand(suggestion);
      addMessage(response.content, 'assistant', response.suggestions);
    } else {
      setInputText(suggestion);
    }
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [processCommand, addMessage]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    // Add user message
    addMessage(inputText, 'user');
    setInputText('');
    
    // Process command and get response
    const response = processCommand(inputText);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate AI thinking
    setTimeout(() => {
      addMessage(response.content, 'assistant', response.suggestions);
      setIsTyping(false);
    }, 800);
  };

  // Toggle voice input
  const toggleListening = useCallback(async () => {
    if (!isSpeechRecognitionAvailable || !isMounted.current) return;

    if (!isListening) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          throw new Error('Speech recognition not supported');
        }
        
        // Stop any existing recognition
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.warn('Error stopping previous recognition:', e);
          }
        }
        
        // Create new recognition instance
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          if (!isMounted.current) return;
          
          try {
            const transcript = event.results[0][0].transcript;
            setInputText(transcript);
            
            // Auto-submit after voice input
            setTimeout(() => {
              if (!isMounted.current) return;
              const submitEvent = new Event('submit', { cancelable: true });
              const form = document.querySelector('form');
              if (form) form.dispatchEvent(submitEvent);
            }, 500);
          } catch (error) {
            console.error('Error processing speech result:', error);
          }
        };
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          if (!isMounted.current) return;
          
          console.error('Speech recognition error:', event.error, event.message);
          toast({
            title: 'Error',
            description: `Could not process voice input: ${event.error}`,
            variant: 'destructive',
          });
        };
        
        recognition.onend = () => {
          if (isMounted.current) {
            setIsListening(false);
          }
        };
        
        // Start listening
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
        
        if (isMounted.current) {
          toast({
            title: 'Error',
            description: 'Failed to initialize speech recognition',
            variant: 'destructive',
          });
          setIsListening(false);
        }
      }
    } else if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      } finally {
        if (isMounted.current) {
          setIsListening(false);
        }
      }
    }
  }, [isListening, isSpeechRecognitionAvailable, toast]);

  // Create a portal for the chat widget to isolate it from parent click handlers
  const createChatWidget = () => {
    return createPortal(
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
              setIsOpen(true);
              setIsMinimized(false);
            }}
            type="button"
            className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Open chat"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        ) : (
          <Card className="w-80 bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300">
            <CardHeader className="bg-gray-50 p-3 border-b flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium">AI Assistant</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                  className="p-1 rounded-md hover:bg-gray-200"
                  aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="p-1 rounded-md hover:bg-gray-200"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            {!isMinimized && (
              <>
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-[calc(600px-120px)] p-4">
                    <div className="space-y-4">
                      {messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.type === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}
                          >
                            {typeof msg.content === 'string' ? (
                              <p>{msg.content}</p>
                            ) : (
                              msg.content
                            )}
                            {msg.suggestions && msg.suggestions.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {msg.suggestions.map((suggestion, i) => (
                                  <button
                                    key={i}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleSuggestionClick(suggestion);
                                    }}
                                    className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded"
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
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
                <div className="p-4 border-t">
                  <form onSubmit={handleSubmit} className="flex space-x-2">
                    <Input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                      aria-label="Type your message"
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleListening();
                      }}
                      className={`p-2 rounded-md ${isListening ? 'text-red-500' : 'text-gray-500'} hover:bg-gray-100`}
                      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                      disabled={!isSpeechRecognitionAvailable}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button
                      type="submit"
                      className="p-2 text-blue-600 rounded-md hover:bg-blue-50"
                      aria-label="Send message"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </Card>
        )}
      </div>,
      document.body
    );
  };

  // Use createPortal to render the chat widget outside the normal DOM hierarchy
  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md">
      <Card className="h-full bg-white/95 backdrop-blur-sm border border-gray-200 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="h-4 w-4" />
            </div>
            <h3 className="font-semibold">Security Assistant</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={toggleAssistant}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex">
                    <div className="flex-1">
                      <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.type !== 'user' && (
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <Bot className="h-3 w-3 text-gray-600" />
                          </div>
                        )}
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}>
                          {typeof message.content === 'string' ? (
                            <p className="text-sm">{message.content}</p>
                          ) : message.content}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion) => (
                                <button
                                  key={suggestion}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {message.type === 'user' && (
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-3 w-3 text-blue-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center space-x-2 p-2">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className="pr-12"
                    disabled={isTyping}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
                    <button
                      onClick={toggleVoiceInput}
                      disabled={!isSpeechRecognitionAvailable || isTyping}
                      className={`p-1 rounded-full ${
                        isListening 
                          ? 'text-red-500 animate-pulse' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isTyping}
                  className="shrink-0"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">
                Type /help for available commands
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>,
    document.body
  );
};

export default AIAssistantWidget;
