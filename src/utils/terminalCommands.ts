import { toast } from "@/components/ui/use-toast";
import { generateMockReport } from "@/services/ReportService";

export type TerminalConnection = {
  id: string;
  host: string;
  type: "ssh" | "agent";
  status: "connected" | "disconnected" | "connecting";
  lastConnected?: Date;
  username?: string;
  port?: number;
  encrypted?: boolean;
}

export type AiSuggestion = {
  command: string;
  description: string;
};

// Terminal utilities
export const executeCommand = async (
  command: string, 
  activeConnection: TerminalConnection | null,
  setOutput: (value: string) => void,
  aiMode: boolean = false
): Promise<TerminalConnection | null | void> => {
  // Split the command into parts
  const args = command.split(' ');
  const cmd = args[0].toLowerCase();
  
  // Handle AI-specific commands
  if (cmd === 'ai-assist' || cmd === 'help') {
    // ... keep existing code (AI assist help output)
    return;
  }

  // AI specific command processing
  if (cmd === 'ai-analyze') {
    // ... keep existing code (AI analyze command)
    return;
  }

  if (cmd === 'ai-summarize') {
    // ... keep existing code (AI summarize command)
    return;
  }

  if (cmd === 'ai-suggest') {
    // ... keep existing code (AI suggest command)
    return;
  }

  if (cmd === 'ai-report') {
    // ... keep existing code (AI report command)
    return;
  }

  if (cmd === 'ai-export') {
    // ... keep existing code (AI export command)
    return;
  }
  
  // Traditional commands
  if (cmd === 'clear') {
    setOutput('');
    return;
  }

  if (cmd === 'ls') {
    // ... keep existing code (ls command)
    return;
  }

  if (cmd === 'cat') {
    // ... keep existing code (cat command)
    return;
  }

  if (cmd === 'tail') {
    // ... keep existing code (tail command)
    return;
  }

  if (cmd === 'ping') {
    // ... keep existing code (ping command)
    return;
  }

  // Enhanced SSH command with better connection handling
  if (cmd === 'ssh') {
    if (args.length < 2) {
      setOutput('\n\x1b[31mUsage: ssh [user@host] [-p port]\x1b[0m\n');
      return;
    }
    
    const sshArg = args[1];
    let user = 'root';
    let host = sshArg;
    let port = 22;
    
    // Parse user@host format
    if (sshArg.includes('@')) {
      [user, host] = sshArg.split('@');
    }
    
    // Check for port option
    const portIndex = args.findIndex(arg => arg === '-p');
    if (portIndex !== -1 && portIndex < args.length - 1) {
      port = parseInt(args[portIndex + 1], 10);
    }
    
    setOutput(`\n\x1b[33mAttempting to connect to ${host}${port !== 22 ? `:${port}` : ''} as ${user} via SSH...\x1b[0m\n`);
    
    // Security notice for remote connections
    if (!host.startsWith('192.168.') && !host.startsWith('10.') && !host.startsWith('127.')) {
      setOutput(`\x1b[33mNote: You are connecting to a remote server outside your local network.\x1b[0m\n`);
      setOutput(`\x1b[33mAll traffic will be encrypted with standard SSH protocols.\x1b[0m\n`);
    }
    
    // Simulate authentication
    setOutput(`\x1b[36mEstablishing secure connection...\x1b[0m\n`);
    await new Promise(resolve => setTimeout(resolve, 800));
    setOutput(`\x1b[36mPerforming key exchange...\x1b[0m\n`);
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Create the connection object
    const connection: TerminalConnection = {
      id: Math.random().toString(36).substring(7),
      host,
      type: 'ssh',
      status: 'connected',
      lastConnected: new Date(),
      username: user,
      port: port,
      encrypted: true
    };
    
    // Show connection status in the terminal
    setOutput(`\x1b[32mSSH connection established to ${host}${port !== 22 ? `:${port}` : ''} as ${user}\x1b[0m\n`);
    setOutput(`\x1b[34mWelcome to ${host}\x1b[0m\n`);
    setOutput(`\x1b[34mConnection secured with AES-256 encryption\x1b[0m\n`);
    setOutput(`Last login: ${new Date().toUTCString()} from 192.168.1.100\n`);
    
    toast({
      title: "SSH Connection Established",
      description: `Connected to ${host} as ${user}`,
    });
    
    return connection;
  }

  if (cmd === 'connect') {
    if (args.length < 2) {
      setOutput('\n\x1b[31mUsage: connect [host] [--type=ssh|agent] [--port=22] [--user=username]\x1b[0m\n');
      return;
    }
    
    const host = args[1];
    const typeArg = args.find(arg => arg.startsWith('--type='));
    const type = typeArg ? typeArg.split('=')[1] as 'ssh' | 'agent' : 'ssh';
    
    const portArg = args.find(arg => arg.startsWith('--port='));
    const port = portArg ? parseInt(portArg.split('=')[1], 10) : 22;
    
    const userArg = args.find(arg => arg.startsWith('--user='));
    const user = userArg ? userArg.split('=')[1] : 'admin';
    
    if (type !== 'ssh' && type !== 'agent') {
      setOutput('\n\x1b[31mInvalid connection type. Use --type=ssh or --type=agent\x1b[0m\n');
      return;
    }
    
    setOutput(`\n\x1b[33mAttempting to connect to ${host}${port !== 22 ? `:${port}` : ''} as ${user} via ${type.toUpperCase()}...\x1b[0m\n`);
    
    // Security notice for remote connections
    if (!host.startsWith('192.168.') && !host.startsWith('10.') && !host.startsWith('127.')) {
      setOutput(`\x1b[33mNote: You are connecting to a remote server outside your local network.\x1b[0m\n`);
      setOutput(`\x1b[33mAll traffic will be encrypted with standard SSH protocols.\x1b[0m\n`);
    }
    
    // Simulate connection process steps
    setOutput(`\x1b[36mResolving hostname...\x1b[0m\n`);
    await new Promise(resolve => setTimeout(resolve, 500));
    setOutput(`\x1b[36mEstablishing connection...\x1b[0m\n`);
    await new Promise(resolve => setTimeout(resolve, 600));
    setOutput(`\x1b[36mAuthenticating as ${user}...\x1b[0m\n`);
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Create the connection object
    const connection: TerminalConnection = {
      id: Math.random().toString(36).substring(7),
      host,
      type,
      status: 'connected',
      lastConnected: new Date(),
      username: user,
      port: port,
      encrypted: type === 'ssh'
    };
    
    // Show status updates in the terminal
    setOutput(`\x1b[32mConnection established to ${host}${port !== 22 ? `:${port}` : ''} via ${type.toUpperCase()}\x1b[0m\n`);
    setOutput(`\x1b[34mWelcome to ${host}\x1b[0m\n`);
    if (type === 'ssh') {
      setOutput(`\x1b[34mConnection secured with AES-256 encryption\x1b[0m\n`);
    }
    
    toast({
      title: "Connection Established",
      description: `Successfully connected to ${host}`,
    });
    
    return connection;
  }

  if (cmd === 'disconnect') {
    if (!activeConnection) {
      setOutput('\n\x1b[31mNo active connection to disconnect.\x1b[0m\n');
      return null;
    }
    
    const hostName = activeConnection.host;
    setOutput(`\n\x1b[33mDisconnecting from ${hostName}...\x1b[0m\n`);
    
    // Simulate disconnect delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setOutput(`\x1b[32mSuccessfully disconnected from ${hostName}\x1b[0m\n`);
    
    toast({
      title: "Disconnected",
      description: `Connection to ${hostName} closed`,
    });
    
    return null;
  }

  if (cmd === 'curl') {
    if (args.length < 2) {
      setOutput('\n\x1b[31mUsage: curl [url]\x1b[0m\n');
      return;
    }
    
    const url = args[1];
    setOutput(`\n\x1b[33mRequesting ${url}...\x1b[0m\n`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (url.includes('cve') || url.includes('threat')) {
      setOutput(`
{
  "cve": {
    "id": "CVE-2023-45693",
    "description": "Authentication bypass vulnerability in X service",
    "cvss_score": 8.4,
    "severity": "HIGH",
    "affected_products": [
      "ProductX v1.2.3-v1.4.5",
      "ProductY v2.0.0-v2.1.2"
    ],
    "mitigation": "Update to latest version or apply patch KB12345",
    "exploit_available": true,
    "exploit_complexity": "LOW",
    "exploit_maturity": "FUNCTIONAL"
  }
}\n`);
    } else if (url.includes('api') || url.includes('status')) {
      setOutput(`
{
  "status": "online",
  "version": "2.5.3",
  "uptime": "14d 7h 23m",
  "connections": 42,
  "load": {
    "cpu": 24.5,
    "memory": 38.2,
    "disk": 56.7
  },
  "services": [
    {"name": "web", "status": "running"},
    {"name": "database", "status": "running"},
    {"name": "monitoring", "status": "running"}
  ]
}\n`);
    } else {
      setOutput(`
<!DOCTYPE html>
<html>
<head>
  <title>Example API Response</title>
</head>
<body>
  <h1>200 OK</h1>
  <p>Request successful</p>
</body>
</html>\n`);
    }
    return;
  }

  if (cmd === 'systeminfo') {
    if (!activeConnection) {
      setOutput('\n\x1b[31mError: No active connection. Use "connect" or "ssh" to establish a connection first.\x1b[0m\n');
      return;
    }
    
    setOutput(`
\x1b[1;34mSystem Information for ${activeConnection.host}\x1b[0m

\x1b[1;33mHost Information:\x1b[0m
  Hostname:           ${activeConnection.host}
  OS:                 Linux 5.15.0-58-generic
  Kernel:             #64-Ubuntu SMP x86_64
  Uptime:             14 days, 7 hours, 23 minutes
  Last Boot:          2023-06-01 08:15:22

\x1b[1;33mHardware:\x1b[0m
  CPU:                Intel(R) Xeon(R) CPU E5-2680 v4 @ 2.40GHz (8 cores)
  Memory:             32GB (7.2GB used)
  Disk:               500GB (42% used)

\x1b[1;33mNetwork:\x1b[0m
  Primary IP:         ${activeConnection.host}
  MAC Address:        00:1A:2B:3C:4D:5E
  Interface:          eth0
  Gateway:            192.168.1.1

\x1b[1;33mServices:\x1b[0m
  SSH:                Running (Port 22)
  HTTP:               Running (Port 80)
  HTTPS:              Running (Port 443)
  MySQL:              Running (Port 3306)
  Splunk:             Running (Port 8000, 8089)

\x1b[1;33mSecurity:\x1b[0m
  Firewall:           Active
  Updates:            3 security updates available
  Last Scan:          2023-06-14 23:00:15
  Security Level:     Medium-High\n`);
    return;
  }

  if (cmd === 'netstat') {
    if (!activeConnection) {
      setOutput('\n\x1b[31mError: No active connection. Use "connect" or "ssh" to establish a connection first.\x1b[0m\n');
      return;
    }
    
    setOutput(`
\x1b[1;34mActive Network Connections for ${activeConnection.host}\x1b[0m

\x1b[1;33mTCP Connections:\x1b[0m
  Proto  Local Address          Foreign Address        State       PID/Program
  tcp    0.0.0.0:22             0.0.0.0:*              LISTEN      1234/sshd
  tcp    0.0.0.0:80             0.0.0.0:*              LISTEN      2345/apache2
  tcp    0.0.0.0:443            0.0.0.0:*              LISTEN      2345/apache2
  tcp    127.0.0.1:3306         0.0.0.0:*              LISTEN      3456/mysqld
  tcp    0.0.0.0:8000           0.0.0.0:*              LISTEN      4567/splunkd
  tcp    0.0.0.0:8089           0.0.0.0:*              LISTEN      4567/splunkd
  tcp    192.168.1.10:22        192.168.1.100:52413    ESTABLISHED 5678/sshd
  tcp    192.168.1.10:443       203.0.113.42:38245     ESTABLISHED 2345/apache2
  tcp    192.168.1.10:55123     93.184.216.34:443      ESTABLISHED 6789/curl

\x1b[1;33mUDP Connections:\x1b[0m
  Proto  Local Address          Foreign Address        State       PID/Program
  udp    0.0.0.0:53             0.0.0.0:*                          7890/dnsmasq
  udp    0.0.0.0:67             0.0.0.0:*                          7890/dnsmasq
  udp    0.0.0.0:123            0.0.0.0:*                          8901/ntpd

\x1b[1;33mUnix Domain Sockets:\x1b[0m
  Proto  RefCnt  Flags  Type  State  I-Node  Path
  unix   2       [ ]    DGRAM          12345   /run/systemd/journal/socket
  unix   2       [ ]    STREAM CONNECTED 23456 /var/run/mysqld/mysqld.sock
  unix   2       [ ]    STREAM CONNECTED 34567 /var/run/apache2/cgisock.sock\n`);
    return;
  }

  if (cmd === 'scanvuln') {
    const target = args.length > 1 ? args[1] : activeConnection?.host || '127.0.0.1';
    
    setOutput(`\n\x1b[33mInitiating vulnerability scan against ${target}...\x1b[0m\n`);
    
    // Simulate vulnerability scanning phases
    const phases = [
      { msg: 'Performing port discovery...', delay: 1000 },
      { msg: 'Identifying running services...', delay: 1500 },
      { msg: 'Checking for common vulnerabilities...', delay: 2000 },
      { msg: 'Analyzing service versions...', delay: 2200 },
      { msg: 'Testing for web application vulnerabilities...', delay: 2500 },
      { msg: 'Scanning for misconfigurations...', delay: 1800 },
      { msg: 'Generating vulnerability report...', delay: 1500 },
    ];
    
    for (let i = 0; i < phases.length; i++) {
      await new Promise(resolve => setTimeout(resolve, phases[i].delay));
      setOutput(`\x1b[36m[${i+1}/${phases.length}] ${phases[i].msg}\x1b[0m\n`);
    }
    
    // Generate some random vulnerabilities based on the target
    const high = Math.floor(Math.random() * 3) + 1;
    const medium = Math.floor(Math.random() * 5) + 2;
    const low = Math.floor(Math.random() * 7) + 3;
    
    setOutput(`
\x1b[32mScan complete. Vulnerabilities found: ${high + medium + low}\x1b[0m

\x1b[1;31mHigh Severity (${high}):\x1b[0m
${high >= 1 ? '- CVE-2023-32233: OpenSSH pre-auth double free (9.8)\n' : ''}${high >= 2 ? '- CVE-2023-29491: SQL Injection in web application (9.1)\n' : ''}${high >= 3 ? '- CVE-2023-38408: Remote Code Execution in Apache (8.7)\n' : ''}

\x1b[1;33mMedium Severity (${medium}):\x1b[0m
${medium >= 1 ? '- SSLv3 POODLE vulnerability (6.8)\n' : ''}${medium >= 2 ? '- Default credentials in admin interface (6.5)\n' : ''}${medium >= 3 ? '- Outdated PHP version with known vulnerabilities (5.9)\n' : ''}${medium >= 4 ? '- Cross-Site Scripting (XSS) in web application (5.4)\n' : ''}${medium >= 5 ? '- Insecure cookie attributes (5.2)\n' : ''}${medium >= 6 ? '- Missing HTTP security headers (5.0)\n' : ''}

\x1b[1;36mLow Severity (${low}):\x1b[0m
${low >= 1 ? '- Information disclosure in HTTP headers (3.7)\n' : ''}${low >= 2 ? '- Directory listing enabled (3.5)\n' : ''}${low >= 3 ? '- Outdated jQuery library (3.2)\n' : ''}${low >= 4 ? '- Cookie without secure flag (2.6)\n' : ''}${low >= 5 ? '- TRACE/TRACK methods enabled (2.5)\n' : ''}

Run \x1b[1mai-analyze\x1b[0m to get AI-powered remediation recommendations or \x1b[1mai-report\x1b[0m to generate a detailed report.\n`);

    toast({
      title: "Vulnerability Scan Complete",
      description: `Found ${high + medium + low} vulnerabilities in ${target}`,
    });
    
    return;
  }

  if (cmd === 'download-report') {
    setOutput('\n\x1b[33mPreparing report for download...\x1b[0m\n');
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate and download mock report
    try {
      const mockReport = await generateMockReport('vulnerability', 'Security');
      
      toast({
        title: "Report Downloaded",
        description: "Threat intelligence report saved as PDF",
      });
      
      setOutput('\n\x1b[32mReport downloaded successfully as "threat_report_2023-06-15.pdf"\x1b[0m\n');
    } catch (err) {
      console.error('Report generation error:', err);
      setOutput(`\n\x1b[31mError generating report: ${err.message}\x1b[0m\n`);
    }
    
    return;
  }

  // Command to show available pages for navigation
  if (cmd === 'pages') {
    setOutput(`
\x1b[1;34mAvailable Navigation Pages:\x1b[0m
  home           - Home dashboard
  dashboard      - Main dashboard (alias for home)
  simulations    - Phishing simulations page
  splunk         - Splunk integration page
  analysis       - Threat analysis dashboard
  documentation  - System documentation
  settings       - System settings page

Use 'goto [page]' or 'nav [page]' to navigate.\n`);
    return;
  }

  // Handle unknown commands
  setOutput(`\n\x1b[31mCommand not found: ${cmd}\x1b[0m\n\nType 'help' for available commands.\n`);
};

export const getAiSuggestions = (input: string): AiSuggestion[] => {
  const suggestions: AiSuggestion[] = [
    {
      command: "ai-analyze /var/log/auth.log",
      description: "Analyze authentication logs for security anomalies"
    },
    {
      command: "ai-summarize",
      description: "Generate natural language summary of terminal activity"
    },
    {
      command: "ai-report",
      description: "Generate comprehensive threat intelligence report"
    },
    {
      command: "ai-export pdf",
      description: "Export current analysis as PDF report"
    },
    {
      command: "ai-export csv",
      description: "Export current analysis as CSV data"
    },
    {
      command: "connect 10.0.12.45 --type=ssh --user=admin",
      description: "Connect to server via SSH protocol"
    },
    {
      command: "ssh admin@192.168.1.10 -p 2222",
      description: "Connect directly via SSH to remote server with custom port"
    },
    {
      command: "tail -f /var/log/security.log",
      description: "Monitor security logs in real-time"
    },
    {
      command: "ping 8.8.8.8",
      description: "Test network connectivity"
    },
    {
      command: "scanvuln 192.168.1.1",
      description: "Run vulnerability scan on target IP"
    },
    {
      command: "systeminfo",
      description: "Display detailed system information"
    },
    {
      command: "netstat",
      description: "Show network connections and listening ports"
    },
    {
      command: "ls",
      description: "List files in current directory"
    },
    {
      command: "cat firewall.conf",
      description: "View firewall configuration file"
    },
    {
      command: "pages",
      description: "Show available pages for navigation"
    }
  ];
  
  if (!input) return suggestions;
  
  // Filter suggestions based on input
  return suggestions.filter(suggestion => 
    suggestion.command.toLowerCase().includes(input.toLowerCase()) ||
    suggestion.description.toLowerCase().includes(input.toLowerCase())
  );
};
