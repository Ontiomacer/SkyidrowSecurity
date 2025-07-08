
import { toast } from '@/components/ui/use-toast';

export interface ReportData {
  title: string;
  timestamp: Date;
  summary: string;
  findings: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
  }>;
  mitreTactics: string[];
  affectedSystems: string[];
  recommendations: string[];
  complianceTags: Array<{
    standard: string;
    control: string;
    description: string;
  }>;
  riskScore: number;
}

export const generateMockReport = (
  type: string,
  name: string,
): Promise<ReportData> => {
  // Simulate network request
  return new Promise((resolve) => {
    setTimeout(() => {
      toast({
        title: "Report generated",
        description: `AI has analyzed the ${type} and created a report.`,
      });
      
      resolve({
        title: `${name} Analysis Report`,
        timestamp: new Date(),
        summary: `This report summarizes the findings from the ${name} ${type}. Several indicators of compromise were detected, suggesting a potential ${type === 'simulation' ? 'vulnerability to' : 'occurrence of'} a sophisticated attack.`,
        findings: [
          {
            id: 'F1',
            title: 'Suspicious PowerShell Execution',
            description: 'Encoded PowerShell commands were executed with elevated privileges, potentially bypassing security controls.',
            severity: 'High',
          },
          {
            id: 'F2',
            title: 'Unusual Network Connection',
            description: 'Outbound connections to known malicious IP addresses were detected.',
            severity: 'Critical',
          },
          {
            id: 'F3',
            title: 'Registry Modifications',
            description: 'Changes to autorun registry keys suggest persistence mechanisms were established.',
            severity: 'Medium',
          },
        ],
        mitreTactics: [
          'Initial Access',
          'Execution',
          'Persistence',
          'Defense Evasion',
          'Command and Control',
        ],
        affectedSystems: [
          'WKSTN-007',
          'SRV-DB-001',
          'SRV-FILE-003',
        ],
        recommendations: [
          'Isolate affected systems for forensic analysis.',
          'Scan all systems with updated antivirus definitions.',
          'Reset credentials for all accounts that logged into affected systems.',
          'Review and update PowerShell execution policies.',
          'Enhance network monitoring for similar connection patterns.',
        ],
        complianceTags: [
          {
            standard: 'NIST CSF',
            control: 'DE.CM-4',
            description: 'Malicious code is detected.',
          },
          {
            standard: 'ISO 27001',
            control: 'A.12.2.1',
            description: 'Controls against malware.',
          },
          {
            standard: 'PCI DSS',
            control: '5.1',
            description: 'Deploy anti-virus software on all systems.',
          },
        ],
        riskScore: 78,
      });
    }, 2000);
  });
};

export const downloadReport = (report: ReportData): void => {
  // In a real application, this would generate a PDF
  // For now, we'll simulate the download with a JSON file
  
  const reportJson = JSON.stringify(report, null, 2);
  const blob = new Blob([reportJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${report.title.replace(/\s+/g, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  toast({
    title: "Report downloaded",
    description: `The report has been downloaded to your device.`,
  });
};
