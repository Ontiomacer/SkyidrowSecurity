import { ProviderResponse } from '../../../types/threatIntel';
import { API_KEYS } from '../../../config/apiKeys';
import { 
  VirusTotalResponse,
  VirusTotalIPAttributes,
  VirusTotalHashAttributes,
  VirusTotalDomainAttributes,
  VirusTotalURLAttributes,
  AnalysisStats
} from '../../../types/virusTotalTypes';

const BASE_URL = 'https://www.virustotal.com/api/v3';

export async function checkIP(ip: string): Promise<ProviderResponse> {
  try {
    const response = await fetch(`${BASE_URL}/ip_addresses/${ip}`, {
      headers: {
        'x-apikey': API_KEYS.VIRUS_TOTAL
      }
    });

    if (!response.ok) {
      throw new Error(`VirusTotal API error: ${response.statusText}`);
    }

    const data = await response.json();
    const attributes = data.data.attributes;
    
    return {
      success: true,
      source: 'VirusTotal',
      malicious: attributes.last_analysis_stats.malicious > 0,
      score: calculateScore(attributes.last_analysis_stats),
      details: {
        stats: attributes.last_analysis_stats,
        country: attributes.country,
        asn: attributes.asn,
        as_owner: attributes.as_owner
      },
      tags: attributes.tags || []
    };
  } catch (error) {
    return {
      success: false,
      source: 'VirusTotal',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: null
    };
  }
}

export async function checkHash(hash: string): Promise<ProviderResponse> {
  try {
    const response = await fetch(`${BASE_URL}/files/${hash}`, {
      headers: {
        'x-apikey': API_KEYS.VIRUS_TOTAL
      }
    });

    if (!response.ok) {
      throw new Error(`VirusTotal API error: ${response.statusText}`);
    }

    const data = await response.json();
    const attributes = data.data.attributes;

    return {
      success: true,
      source: 'VirusTotal',
      malicious: attributes.last_analysis_stats.malicious > 0,
      score: calculateScore(attributes.last_analysis_stats),
      details: {
        stats: attributes.last_analysis_stats,
        type_description: attributes.type_description,
        size: attributes.size,
        md5: attributes.md5,
        sha1: attributes.sha1,
        sha256: attributes.sha256
      },
      tags: attributes.tags || []
    };
  } catch (error) {
    return {
      success: false,
      source: 'VirusTotal',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: null
    };
  }
}

export async function checkDomain(domain: string): Promise<ProviderResponse> {
  try {
    const response = await fetch(`${BASE_URL}/domains/${domain}`, {
      headers: {
        'x-apikey': API_KEYS.VIRUS_TOTAL
      }
    });

    if (!response.ok) {
      throw new Error(`VirusTotal API error: ${response.statusText}`);
    }

    const data = await response.json();
    const attributes = data.data.attributes;

    return {
      success: true,
      source: 'VirusTotal',
      malicious: attributes.last_analysis_stats.malicious > 0,
      score: calculateScore(attributes.last_analysis_stats),
      details: {
        stats: attributes.last_analysis_stats,
        registrar: attributes.registrar,
        creation_date: attributes.creation_date,
        last_dns_records: attributes.last_dns_records
      },
      tags: attributes.tags || []
    };
  } catch (error) {
    return {
      success: false,
      source: 'VirusTotal',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: null
    };
  }
}

export async function checkURL(url: string): Promise<ProviderResponse> {
  try {
    // First, submit URL for scanning
    const submitResponse = await fetch(`${BASE_URL}/urls`, {
      method: 'POST',
      headers: {
        'x-apikey': API_KEYS.VIRUS_TOTAL,
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: `url=${encodeURIComponent(url)}`
    });

    if (!submitResponse.ok) {
      throw new Error(`VirusTotal API error: ${submitResponse.statusText}`);
    }

    const submitData = await submitResponse.json();
    const analysisId = submitData.data.id;

    // Wait for analysis to complete
    const result = await pollAnalysis(analysisId);
    // result is VirusTotalURLAttributes
    return {
      success: true,
      source: 'VirusTotal',
      malicious: result.last_analysis_stats.malicious > 0,
      score: calculateScore(result.last_analysis_stats),
      details: {
        stats: result.last_analysis_stats,
        threat_names: result.threat_names,
        analysis_id: analysisId
      },
      tags: result.tags || []
    };
  } catch (error) {
    return {
      success: false,
      source: 'VirusTotal',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: null
    };
  }
}

async function pollAnalysis(id: string, maxAttempts = 10): Promise<VirusTotalURLAttributes> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`${BASE_URL}/analyses/${id}`, {
      headers: {
        'x-apikey': API_KEYS.VIRUS_TOTAL
      }
    });

    if (!response.ok) {
      throw new Error(`VirusTotal API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.data.attributes.status === 'completed') {
      return data.data.attributes;
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Analysis timed out');
}

function calculateScore(stats: AnalysisStats): number {
  const total = stats.harmless + stats.malicious + stats.suspicious + stats.undetected + stats.timeout;
  return total > 0 ? stats.malicious / total : 0;
}
