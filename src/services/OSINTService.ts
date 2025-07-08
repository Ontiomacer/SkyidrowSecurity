
import { supabase } from '@/integrations/supabase/client';

export class OSINTService {
  private async callOSINTFunction(tool: string, target: string): Promise<any> {
    console.log(`Calling OSINT backend for ${tool}: ${target}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('osint-query', {
        body: { tool, target }
      });

      if (error) {
        throw new Error(error.message || 'OSINT function call failed');
      }

      return data;
    } catch (error) {
      console.error(`OSINT backend error for ${tool}:`, error);
      throw error;
    }
  }

  async queryVirusTotal(target: string): Promise<any> {
    return this.callOSINTFunction('virustotal', target);
  }

  async queryAbuseDB(target: string): Promise<any> {
    return this.callOSINTFunction('abusedb', target);
  }

  async queryShodan(target: string): Promise<any> {
    return this.callOSINTFunction('shodan', target);
  }

  async queryWHOIS(domain: string): Promise<any> {
    return this.callOSINTFunction('whois', domain);
  }

  async queryURLScan(url: string): Promise<any> {
    return this.callOSINTFunction('urlscan', url);
  }

  async performGoogleDorking(query: string): Promise<any> {
    return this.callOSINTFunction('google-dork', query);
  }
}

export const osintService = new OSINTService();
