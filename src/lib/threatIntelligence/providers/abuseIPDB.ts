import { ProviderResponse } from '../../../types/threatIntel';
import { API_KEYS } from '../../../config/apiKeys';

export async function checkIP(ip: string): Promise<ProviderResponse> {
  try {
    const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`, {
      headers: {
        'Key': API_KEYS.ABUSE_IPDB,
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`AbuseIPDB API error: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      success: true,
      source: 'AbuseIPDB',
      malicious: data.data.abuseConfidenceScore > 50,
      score: data.data.abuseConfidenceScore,
      details: data.data,
      tags: data.data.categories ? data.data.categories.map((c: any) => c.description) : [],
    };
  } catch (error) {
    return {
      success: false,
      source: 'AbuseIPDB',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
