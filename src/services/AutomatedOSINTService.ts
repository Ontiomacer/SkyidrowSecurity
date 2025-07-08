
import { osintService } from './OSINTService';
import { DownloadService } from './DownloadService';
import { usageTrackingService } from './UsageTrackingService';
import { toast } from '@/components/ui/use-toast';

export class AutomatedOSINTService {
  private static instance: AutomatedOSINTService;
  private results: Record<string, any> = {};

  static getInstance(): AutomatedOSINTService {
    if (!AutomatedOSINTService.instance) {
      AutomatedOSINTService.instance = new AutomatedOSINTService();
    }
    return AutomatedOSINTService.instance;
  }

  // Extract target and tool from user input
  parseOSINTCommand(input: string): { tool: string; target: string; action?: string } | null {
    const lowercaseInput = input.toLowerCase();
    
    // Check for download request
    const isDownloadRequest = lowercaseInput.includes('download');
    
    // Tool detection patterns
    const toolPatterns = {
      'virustotal': ['virustotal', 'virus total', 'vt scan', 'malware scan'],
      'abusedb': ['abuseipdb', 'abuse ip', 'ip reputation', 'malicious ip'],
      'shodan': ['shodan', 'device scan', 'port scan', 'internet scan'],
      'whois': ['whois', 'domain info', 'domain lookup', 'registration'],
      'urlscan': ['urlscan', 'url scan', 'website scan', 'site analysis'],
      'google-dork': ['google dork', 'google search', 'dork query', 'search engine']
    };

    let detectedTool = '';
    for (const [tool, patterns] of Object.entries(toolPatterns)) {
      if (patterns.some(pattern => lowercaseInput.includes(pattern))) {
        detectedTool = tool;
        break;
      }
    }

    if (!detectedTool && !isDownloadRequest) return null;

    // Extract target (IP, domain, URL, or search query)
    const targetPatterns = [
      // IP addresses
      /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
      // Domains
      /\b[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\b/,
      // URLs
      /https?:\/\/[^\s]+/,
    ];

    let target = '';
    for (const pattern of targetPatterns) {
      const match = input.match(pattern);
      if (match) {
        target = match[0];
        break;
      }
    }

    // For Google dorking, extract the query after common keywords
    if (detectedTool === 'google-dork' && !target) {
      const dorkKeywords = ['search for', 'find', 'look for', 'query', 'dork'];
      for (const keyword of dorkKeywords) {
        const index = lowercaseInput.indexOf(keyword);
        if (index !== -1) {
          target = input.substring(index + keyword.length).trim();
          // Remove quotes if present
          target = target.replace(/^["']|["']$/g, '');
          break;
        }
      }
    }

    return {
      tool: detectedTool,
      target: target,
      action: isDownloadRequest ? 'download' : 'scan'
    };
  }

  // Automated OSINT scanning
  async performAutomatedScan(tool: string, target: string): Promise<any> {
    if (!target || !target.trim()) {
      throw new Error('Invalid target provided');
    }

    const startTime = Date.now();
    
    try {
      let result;
      
      switch (tool) {
        case 'virustotal':
          result = await osintService.queryVirusTotal(target.trim());
          break;
        case 'abusedb':
          result = await osintService.queryAbuseDB(target.trim());
          break;
        case 'shodan':
          result = await osintService.queryShodan(target.trim());
          break;
        case 'whois':
          result = await osintService.queryWHOIS(target.trim());
          break;
        case 'urlscan':
          result = await osintService.queryURLScan(target.trim());
          break;
        case 'google-dork':
          result = await osintService.performGoogleDorking(target.trim());
          break;
        default:
          throw new Error(`Unknown tool: ${tool}`);
      }

      const responseTime = Date.now() - startTime;
      const success = !result.error;

      // Log the query for analytics
      usageTrackingService.logQuery({
        id: Date.now().toString(),
        userId: 'anonymous',
        tool: tool as any,
        query: target.trim(),
        timestamp: new Date(),
        success,
        responseTime,
        errorMessage: result.error || undefined
      });

      // Store results for potential download
      this.results[tool] = result;

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Log the failed query
      usageTrackingService.logQuery({
        id: Date.now().toString(),
        userId: 'anonymous',
        tool: tool as any,
        query: target.trim(),
        timestamp: new Date(),
        success: false,
        responseTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  // Automated download
  async performAutomatedDownload(tool: string, format: 'json' | 'csv' | 'txt' = 'json'): Promise<boolean> {
    const result = this.results[tool];
    
    if (!result) {
      throw new Error(`No results available for ${tool}. Please run a scan first.`);
    }

    try {
      const filename = DownloadService.generateFilename(tool, 'automated_scan');
      
      switch (format) {
        case 'json':
          DownloadService.downloadJSON(result, filename);
          break;
        case 'csv':
          DownloadService.downloadCSV(result, filename);
          break;
        case 'txt':
          DownloadService.downloadTXT(result, filename);
          break;
      }
      
      return true;
    } catch (error) {
      throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get latest results for a tool
  getResults(tool: string): any {
    return this.results[tool] || null;
  }

  // Clear results
  clearResults(): void {
    this.results = {};
  }

  // Format results for display
  formatResultsForDisplay(tool: string, result: any): string {
    if (result.error) {
      return `❌ **${tool.toUpperCase()} Analysis Failed**\n\n**Error:** ${result.error}\n\n${result.suggestion ? `**Solution:** ${result.suggestion}` : ''}`;
    }

    let summary = `✅ **${tool.toUpperCase()} Analysis Complete**\n\n`;
    
    switch (tool) {
      case 'virustotal':
        if (result.data) {
          const positives = result.data.positives || 0;
          const total = result.data.total || 0;
          summary += `**Detection:** ${positives}/${total} engines flagged this as malicious\n`;
          summary += `**Scan Date:** ${result.data.scan_date || 'Unknown'}\n`;
        }
        break;
      case 'abusedb':
        if (result.data) {
          summary += `**Confidence:** ${result.data.abuseConfidencePercentage || 0}%\n`;
          summary += `**Country:** ${result.data.countryCode || 'Unknown'}\n`;
          summary += `**ISP:** ${result.data.isp || 'Unknown'}\n`;
        }
        break;
      case 'shodan':
        if (result.data) {
          summary += `**Organization:** ${result.data.org || 'Unknown'}\n`;
          summary += `**Country:** ${result.data.country_name || 'Unknown'}\n`;
          summary += `**Open Ports:** ${result.data.ports ? result.data.ports.join(', ') : 'None detected'}\n`;
        }
        break;
      case 'whois':
        if (result.data) {
          summary += `**Registrar:** ${result.data.registrar || 'Unknown'}\n`;
          summary += `**Creation Date:** ${result.data.creation_date || 'Unknown'}\n`;
          summary += `**Expiration Date:** ${result.data.expiration_date || 'Unknown'}\n`;
        }
        break;
      case 'urlscan':
        if (result.data) {
          summary += `**Verdict:** ${result.data.verdict || 'Unknown'}\n`;
          summary += `**Score:** ${result.data.score || 'N/A'}\n`;
          summary += `**Country:** ${result.data.country || 'Unknown'}\n`;
        }
        break;
      case 'google-dork':
        if (result.results) {
          summary += `**Results Found:** ${result.results.length}\n`;
          summary += `**Query:** ${result.query}\n`;
          if (result.results.length > 0) {
            summary += `**Top Results:**\n`;
            result.results.slice(0, 3).forEach((item: any, index: number) => {
              summary += `${index + 1}. ${item.title}\n   ${item.link}\n`;
            });
          }
        }
        break;
    }

    summary += `\n📊 **Full results available on the OSINT page**\n`;
    summary += `💾 **Say "download" to save these results**`;

    return summary;
  }
}

export const automatedOSINTService = AutomatedOSINTService.getInstance();
