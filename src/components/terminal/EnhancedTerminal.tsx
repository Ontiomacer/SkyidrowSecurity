
import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { executeCommand, TerminalConnection, getAiSuggestions } from '@/utils/terminalCommands';
import { toast } from '@/components/ui/use-toast';
import 'xterm/css/xterm.css';

interface EnhancedTerminalProps {
  className?: string;
  currentInputCommand?: string;
  onTerminalOutput?: (output: string) => void;
}

const EnhancedTerminal: React.FC<EnhancedTerminalProps> = ({ 
  className, 
  currentInputCommand = '', 
  onTerminalOutput 
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [connections, setConnections] = useState<TerminalConnection[]>([]);
  const [activeConnection, setActiveConnection] = useState<TerminalConnection | null>(null);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [terminalReady, setTerminalReady] = useState(false);

  // Effect to handle new commands from the AI Assistant
  useEffect(() => {
    if (currentInputCommand && xtermRef.current && terminalReady) {
      // Clear current line
      while (xtermRef.current.buffer.active.cursorX > 2) {
        xtermRef.current.write('\b \b');
      }
      
      // Write suggested command
      xtermRef.current.write(currentInputCommand);
      setCurrentInput(currentInputCommand);
    }
  }, [currentInputCommand, terminalReady]);

  const writeToTerminal = (term: XTerm, text: string) => {
    term.write(text);
    if (onTerminalOutput) {
      onTerminalOutput(text);
    }
  };

  // Terminal initialization
  useEffect(() => {
    if (terminalRef.current && !xtermRef.current) {
      // Initialize xterm.js
      const term = new XTerm({
        cursorBlink: true,
        theme: {
          background: '#171923',
          foreground: '#c0caf5',
          cursor: '#f8f8f2',
          green: '#9ece6a',
          yellow: '#e0af68',
          blue: '#7aa2f7',
          red: '#f7768e',
          magenta: '#bb9af7',
          cyan: '#7dcfff',
          brightGreen: '#b9f27c',
          brightYellow: '#ff9e64',
          brightBlue: '#7da6ff',
          brightRed: '#ff7a93',
          brightMagenta: '#d0a9ff',
          brightCyan: '#8de5ff',
          selectionBackground: '#3d59a1',
          selectionForeground: '#ffffff',
        },
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        fontSize: 15,
        lineHeight: 1.5,
        rows: 36,
        cols: 120,
        scrollback: 5000,
        smoothScrollDuration: 300,
        letterSpacing: 0.8,
      });
      
      // Create addons
      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();
      
      // Load addons
      term.loadAddon(fitAddon);
      term.loadAddon(webLinksAddon);
      
      // Open terminal in the container
      term.open(terminalRef.current);
      
      // Fit the terminal to the container
      setTimeout(() => {
        fitAddon.fit();
        setTerminalReady(true);
      }, 100);
      
      // Display an updated welcome message with SSH instructions
      term.writeln('\x1b[1;34m╔═════════════════════════════════════════════════════════════╗\x1b[0m');
      term.writeln('\x1b[1;34m║                                                             ║\x1b[0m');
      term.writeln('\x1b[1;34m║  \x1b[1;36mSkyidrow Security Intelligence Terminal v2.1\x1b[1;34m            ║\x1b[0m');
      term.writeln('\x1b[1;34m║                                                             ║\x1b[0m');
      term.writeln('\x1b[1;34m╚═════════════════════════════════════════════════════════════╝\x1b[0m');
      term.writeln('');
      term.writeln('\x1b[32m┌─────────────────────────────────────────────────────────┐\x1b[0m');
      term.writeln('\x1b[32m│  🔐  Secure Terminal Connection [\x1b[1mSSH Enabled\x1b[0;32m]       │\x1b[0m');
      term.writeln('\x1b[32m└──────────────────────────────────────────────────────────┘\x1b[0m');
      term.writeln('');
      term.writeln('\x1b[90mLogged in as:\x1b[0m \x1b[1;36m' + (currentUser?.username || 'anonymous') + '\x1b[0m');
      term.writeln('\x1b[90mRole:\x1b[0m \x1b[1;33m' + (currentUser?.role || 'guest') + '\x1b[0m');
      term.writeln('\x1b[90mType "\x1b[1;37mhelp\x1b[0;90m" for available commands or "\x1b[1;37mai-assist\x1b[0;90m" for AI help\x1b[0m');
      term.writeln('\x1b[90mConnect to remote systems with:\x1b[0m');
      term.writeln('\x1b[1;36m  - ssh user@host\x1b[0m');
      term.writeln('\x1b[1;36m  - connect host --type=ssh\x1b[0m');
      term.writeln('');
      term.write('\r\n\x1b[1;32m$ \x1b[0m');
      
      // Define available routes
      const routes = {
        'home': '/',
        'dashboard': '/',
        'simulations': '/simulations',
        'splunk': '/splunk',
        'settings': '/settings',
        'analysis': '/analysis',
        'documentation': '/documentation',
      };
      
      // Handle user input
      let currentInputBuffer = '';
      
      term.onKey(({ key, domEvent }) => {
        const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
        
        if (domEvent.keyCode === 13) { // Enter key
          const command = currentInputBuffer;
          currentInputBuffer = '';
          
          // Add to command history
          if (command.trim() !== '') {
            setCommandHistory(prev => [command, ...prev.slice(0, 19)]); // Keep last 20 commands
          }
          setHistoryIndex(-1);
          
          // Execute the command
          processCommand(command, term);
        } else if (domEvent.keyCode === 8) { // Backspace
          // Move cursor back and delete character
          if (term.buffer.active.cursorX > 2 && currentInputBuffer.length > 0) {
            term.write('\b \b');
            currentInputBuffer = currentInputBuffer.slice(0, -1);
            setCurrentInput(currentInputBuffer);
          }
        } else if (domEvent.keyCode === 38) { // Up arrow - command history
          if (commandHistory.length > 0) {
            const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
            setHistoryIndex(newIndex);
            const historyCommand = commandHistory[newIndex];
            
            // Clear current input
            while (currentInputBuffer.length > 0) {
              term.write('\b \b');
              currentInputBuffer = currentInputBuffer.slice(0, -1);
            }
            
            // Write history command
            term.write(historyCommand);
            currentInputBuffer = historyCommand;
            setCurrentInput(currentInputBuffer);
          }
        } else if (domEvent.keyCode === 40) { // Down arrow - command history
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const historyCommand = commandHistory[newIndex];
            
            // Clear current input
            while (currentInputBuffer.length > 0) {
              term.write('\b \b');
              currentInputBuffer = currentInputBuffer.slice(0, -1);
            }
            
            // Write history command
            term.write(historyCommand);
            currentInputBuffer = historyCommand;
            setCurrentInput(currentInputBuffer);
          } else if (historyIndex === 0) {
            setHistoryIndex(-1);
            
            // Clear current input
            while (currentInputBuffer.length > 0) {
              term.write('\b \b');
              currentInputBuffer = currentInputBuffer.slice(0, -1);
            }
            setCurrentInput('');
          }
        } else if (printable) {
          term.write(key);
          currentInputBuffer += key;
          setCurrentInput(currentInputBuffer);
        }
      });
      
      // Handle window resize
      const handleResize = () => {
        fitAddon.fit();
      };
      window.addEventListener('resize', handleResize);
      
      xtermRef.current = term;
      
      // Setup event listener for vulnerability scan events
      const handleVulnerabilityScanStart = () => {
        if (xtermRef.current) {
          xtermRef.current.writeln('\r\n\x1b[33mStarting vulnerability scan on connected systems...\x1b[0m');
          simulateScanOutput(xtermRef.current);
        }
      };
      
      window.addEventListener('start-vulnerability-scan', handleVulnerabilityScanStart);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('start-vulnerability-scan', handleVulnerabilityScanStart);
        term.dispose();
        xtermRef.current = null;
      };
    }
  }, [navigate, currentUser]);

  // Function to simulate scan output
  const simulateScanOutput = (term: XTerm) => {
    const phases = [
      { msg: 'Initializing scan engine...', delay: 1000 },
      { msg: 'Scanning network devices...', delay: 1500 },
      { msg: 'Checking for open ports...', delay: 2000 },
      { msg: 'Scanning for known vulnerabilities...', delay: 3000 },
      { msg: 'Testing SQL injection vectors...', delay: 1800 },
      { msg: 'Analyzing web applications...', delay: 2200 },
      { msg: 'Checking SSL/TLS configurations...', delay: 1500 },
      { msg: 'Searching for outdated software...', delay: 2000 },
      { msg: 'Generating vulnerability report...', delay: 1500 },
    ];
    
    let currentIndex = 0;
    
    const writeNextPhase = () => {
      if (currentIndex < phases.length) {
        writeToTerminal(term, `\r\n\x1b[36m[${currentIndex + 1}/${phases.length}] ${phases[currentIndex].msg}\x1b[0m\n`);
        
        setTimeout(() => {
          currentIndex++;
          writeNextPhase();
        }, phases[currentIndex].delay);
      } else {
        // Scan complete
        writeToTerminal(term, '\r\n\x1b[32mScan complete. Found 7 potential vulnerabilities.\x1b[0m\n');
        writeToTerminal(term, '\x1b[33m- Critical (2): SQL injection, Outdated OpenSSL\x1b[0m\n');
        writeToTerminal(term, '\x1b[33m- High (3): Missing patches, Weak cipher suites, Default credentials\x1b[0m\n');
        writeToTerminal(term, '\x1b[33m- Medium (2): Directory listing enabled, Information disclosure\x1b[0m\n');
        writeToTerminal(term, '\r\nFull report generated. Type \x1b[1mai-report\x1b[0m to analyze findings or \x1b[1mdownload-report\x1b[0m to save as PDF.\n');
        writeToTerminal(term, '\r\n$ ');
      }
    };
    
    writeNextPhase();
  };

  // Function to process commands and update state
  const processCommand = async (command: string, term: XTerm) => {
    writeToTerminal(term, '\n');
    const args = command.split(' ');
    
    // Execute the command
    try {
      const result = await executeCommand(
        command, 
        activeConnection, 
        (output) => {
          writeToTerminal(term, output);
        },
        aiEnabled
      );
      
      // Handle connection results
      if (result && typeof result === 'object' && 'status' in result) {
        const connection = result as TerminalConnection;
        setConnections(prev => [...prev, connection]);
        setActiveConnection(connection);
        
        // Notify parent of successful connection
        if (onTerminalOutput) {
          onTerminalOutput(`Connected to ${connection.host}`);
        }
      } else if (result === null) {
        // Disconnect command
        setActiveConnection(null);
      }
      
      // Handle navigation commands
      if (args[0] === 'goto' || args[0] === 'nav') {
        if (args.length < 2) {
          writeToTerminal(term, '\x1b[31mError: Missing destination. Usage: goto <page>\x1b[0m\n');
          writeToTerminal(term, '\r\n$ ');
          return;
        }

        const routes = {
          'home': '/',
          'dashboard': '/',
          'simulations': '/simulations',
          'splunk': '/splunk',
          'settings': '/settings',
          'analysis': '/analysis',
          'documentation': '/documentation',
        };

        const destination = args[1].toLowerCase();
        if (routes[destination]) {
          writeToTerminal(term, `\x1b[32mNavigating to ${destination}...\x1b[0m\n`);
          setTimeout(() => {
            navigate(routes[destination]);
            writeToTerminal(term, '\x1b[32mNavigation complete.\x1b[0m\n');
            writeToTerminal(term, '\r\n$ ');
          }, 500);
        } else {
          writeToTerminal(term, `\x1b[31mError: Unknown page "${destination}". Use "pages" to see available options.\x1b[0m\n`);
          writeToTerminal(term, '\r\n$ ');
        }
        return;
      }

      // Add new prompt for most commands
      if (args[0] !== 'goto' && args[0] !== 'nav') {
        writeToTerminal(term, '\r\n$ ');
      }
    } catch (error) {
      console.error("Command execution error:", error);
      if (error instanceof Error) {
        writeToTerminal(term, `\r\n\x1b[31mError executing command: ${error.message}\x1b[0m\n`);
      } else {
        writeToTerminal(term, `\r\n\x1b[31mUnknown error executing command\x1b[0m\n`);
      }
      writeToTerminal(term, '\r\n$ ');
    }
  };

  return (
    <div className={`relative h-full ${className}`}>
      <div className="h-8 bg-gray-800 flex items-center px-4 border-b border-gray-700">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-sm text-gray-200 mx-auto flex items-center">
          {activeConnection ? 
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              {activeConnection.username ? `${activeConnection.username}@${activeConnection.host}` : activeConnection.host}
              {activeConnection.port && activeConnection.port !== 22 ? `:${activeConnection.port}` : ''}
              {' '}({activeConnection.type}{activeConnection.encrypted ? ' - encrypted' : ''})
            </span>
            : 
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
              Terminal
            </span>
          }
          {aiEnabled && <span className="ml-3 text-blue-400 flex items-center">• AI Enhanced</span>}
          {isAnalyzing && <span className="ml-3 text-yellow-400 flex items-center">• Analysis in Progress</span>}
        </div>
        <div className="ml-auto text-sm text-gray-300">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
      <div ref={terminalRef} className="w-full h-[calc(100%-2rem)] p-1 bg-[#171923]" />
    </div>
  );
};

export default EnhancedTerminal;
