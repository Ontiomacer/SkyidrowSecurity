
export interface ThreatData {
  id: string;
  type: 'malware' | 'phishing' | 'ddos' | 'data_breach' | 'insider_threat' | 'apt';
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  target: string;
  description: string;
  indicators: string[];
  timestamp: string;
  status: 'active' | 'investigating' | 'contained' | 'resolved';
  confidence: number;
  mitreTactics: string[];
}

export interface VulnerabilityData {
  id: string;
  cve: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvssScore: number;
  affectedSystems: number;
  description: string;
  solution: string;
  discovered: string;
  category: string;
}

export interface IOCData {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email';
  value: string;
  confidence: 'high' | 'medium' | 'low';
  source: string;
  firstSeen: string;
  lastSeen: string;
  tags: string[];
  threatTypes: string[];
  reputation: number;
}

export const recentThreats: ThreatData[] = [
  {
    id: 'THR-2025-001',
    type: 'apt',
    severity: 'critical',
    source: '185.147.36.42',
    target: 'Internal Network',
    description: 'Advanced Persistent Threat group APT41 attempting lateral movement through compromised domain controller. Multiple failed authentication attempts detected.',
    indicators: ['185.147.36.42', 'mal-delivery.net', 'psexec.exe'],
    timestamp: '2025-01-15T10:30:00Z',
    status: 'investigating',
    confidence: 95,
    mitreTactics: ['Initial Access', 'Lateral Movement', 'Persistence']
  },
  {
    id: 'THR-2025-002',
    type: 'phishing',
    severity: 'high',
    source: 'finance@legitimate-invoice.co',
    target: 'Finance Department',
    description: 'Sophisticated spear-phishing campaign targeting finance personnel with fake invoice attachments containing Emotet payload.',
    indicators: ['finance@legitimate-invoice.co', 'invoice_march_2025.pdf.exe'],
    timestamp: '2025-01-15T09:15:00Z',
    status: 'contained',
    confidence: 88,
    mitreTactics: ['Initial Access', 'Execution']
  },
  {
    id: 'THR-2025-003',
    type: 'malware',
    severity: 'high',
    source: 'Unknown',
    target: 'Workstation-047',
    description: 'BlackCat ransomware variant detected on endpoint. File encryption in progress, containment protocols activated.',
    indicators: ['9f4b53db3582b66c6b9c441d7195337e', 'C:\\temp\\encrypt.exe'],
    timestamp: '2025-01-15T08:45:00Z',
    status: 'contained',
    confidence: 92,
    mitreTactics: ['Impact', 'Defense Evasion']
  },
  {
    id: 'THR-2025-004',
    type: 'ddos',
    severity: 'medium',
    source: 'Botnet (Multiple IPs)',
    target: 'Web Server Farm',
    description: 'Distributed Denial of Service attack targeting public web services. Traffic volume exceeded 10Gbps threshold.',
    indicators: ['193.23.45.67', '78.129.34.56', '203.145.67.89'],
    timestamp: '2025-01-15T07:20:00Z',
    status: 'resolved',
    confidence: 85,
    mitreTactics: ['Impact']
  }
];

export const activeVulnerabilities: VulnerabilityData[] = [
  {
    id: 'VUL-2025-001',
    cve: 'CVE-2024-38200',
    title: 'Microsoft Windows Kernel Elevation of Privilege',
    severity: 'critical',
    cvssScore: 9.8,
    affectedSystems: 23,
    description: 'A critical vulnerability in the Windows kernel allows local attackers to gain SYSTEM privileges through improper memory handling.',
    solution: 'Apply Microsoft Security Update KB5034763 immediately. Restrict local logon permissions where possible.',
    discovered: '2025-01-10T14:30:00Z',
    category: 'Privilege Escalation'
  },
  {
    id: 'VUL-2025-002',
    cve: 'CVE-2024-45590',
    title: 'Apache HTTP Server Request Smuggling',
    severity: 'high',
    cvssScore: 8.1,
    affectedSystems: 7,
    description: 'HTTP request smuggling vulnerability in Apache HTTP Server versions 2.4.0 to 2.4.58 allows attackers to bypass security controls.',
    solution: 'Upgrade to Apache HTTP Server 2.4.59 or later. Configure proper request validation.',
    discovered: '2025-01-12T11:15:00Z',
    category: 'Web Application'
  },
  {
    id: 'VUL-2025-003',
    cve: 'CVE-2024-42137',
    title: 'OpenSSL Certificate Validation Bypass',
    severity: 'high',
    cvssScore: 7.4,
    affectedSystems: 15,
    description: 'Certificate validation bypass in OpenSSL 3.0.x allows man-in-the-middle attacks through crafted certificates.',
    solution: 'Update OpenSSL to version 3.0.15 or 3.1.7. Implement certificate pinning for critical applications.',
    discovered: '2025-01-08T16:45:00Z',
    category: 'Cryptographic'
  },
  {
    id: 'VUL-2025-004',
    cve: 'CVE-2024-38074',
    title: 'Windows TCP/IP Remote Code Execution',
    severity: 'critical',
    cvssScore: 9.8,
    affectedSystems: 41,
    description: 'Remote code execution vulnerability in Windows TCP/IP stack allows unauthenticated attackers to execute arbitrary code.',
    solution: 'Install Windows Update KB5039211 immediately. Consider network segmentation for critical assets.',
    discovered: '2025-01-05T09:20:00Z',
    category: 'Network Protocol'
  }
];

export const threatIntelligenceIOCs: IOCData[] = [
  {
    id: 'IOC-001',
    type: 'ip',
    value: '185.147.36.42',
    confidence: 'high',
    source: 'VirusTotal',
    firstSeen: '2025-01-10T08:00:00Z',
    lastSeen: '2025-01-15T10:30:00Z',
    tags: ['C2', 'APT41', 'Malicious'],
    threatTypes: ['Command and Control', 'Data Exfiltration'],
    reputation: 85
  },
  {
    id: 'IOC-002',
    type: 'domain',
    value: 'mal-delivery.net',
    confidence: 'high',
    source: 'MISP',
    firstSeen: '2025-01-08T14:20:00Z',
    lastSeen: '2025-01-15T09:15:00Z',
    tags: ['Phishing', 'Emotet', 'Malware Distribution'],
    threatTypes: ['Phishing', 'Malware Hosting'],
    reputation: 92
  },
  {
    id: 'IOC-003',
    type: 'hash',
    value: '9f4b53db3582b66c6b9c441d7195337e',
    confidence: 'high',
    source: 'Internal',
    firstSeen: '2025-01-15T08:45:00Z',
    lastSeen: '2025-01-15T08:45:00Z',
    tags: ['Ransomware', 'BlackCat', 'Encryption'],
    threatTypes: ['Ransomware', 'File Encryption'],
    reputation: 98
  },
  {
    id: 'IOC-004',
    type: 'url',
    value: 'https://malicious-update.io/download.php',
    confidence: 'medium',
    source: 'AlienVault',
    firstSeen: '2025-01-12T16:30:00Z',
    lastSeen: '2025-01-14T12:15:00Z',
    tags: ['Dropper', 'Credential Theft', 'Fake Update'],
    threatTypes: ['Malware Distribution', 'Social Engineering'],
    reputation: 78
  },
  {
    id: 'IOC-005',
    type: 'email',
    value: 'finance@legitimate-invoice.co',
    confidence: 'medium',
    source: 'PhishTank',
    firstSeen: '2025-01-14T11:00:00Z',
    lastSeen: '2025-01-15T09:15:00Z',
    tags: ['BEC', 'Social Engineering', 'Finance Targeting'],
    threatTypes: ['Business Email Compromise', 'Phishing'],
    reputation: 72
  }
];

export const securityMetrics = {
  totalThreats: 24,
  activeCases: 7,
  resolvedToday: 12,
  meanTimeToDetection: '8.5 minutes',
  meanTimeToResponse: '23 minutes',
  securityScore: 86,
  vulnerabilities: {
    critical: 2,
    high: 5,
    medium: 9,
    low: 15
  },
  complianceStatus: {
    nist: 92,
    pci: 78,
    hipaa: 95,
    soc2: 65,
    iso27001: 87
  },
  networkHealth: {
    monitoredSystems: 42,
    alertsLast24h: 156,
    falsePositiveRate: 12,
    uptimePercentage: 99.7
  }
};

export const phishingSimulationData = {
  campaigns: [
    {
      id: 'PHISH-001',
      name: 'Q1 2025 Finance Department Test',
      status: 'completed',
      recipients: 45,
      opened: 12,
      clicked: 3,
      reported: 8,
      successRate: 82,
      date: '2025-01-10'
    },
    {
      id: 'PHISH-002',
      name: 'Executive Team Social Engineering Test',
      status: 'active',
      recipients: 15,
      opened: 5,
      clicked: 1,
      reported: 3,
      successRate: 80,
      date: '2025-01-15'
    }
  ],
  templates: [
    'Invoice Payment Required',
    'IT Security Update',
    'HR Policy Changes',
    'Cloud Storage Migration',
    'Password Expiration Notice'
  ],
  awareness: {
    baseline: 45,
    current: 87,
    improvement: 93
  }
};
