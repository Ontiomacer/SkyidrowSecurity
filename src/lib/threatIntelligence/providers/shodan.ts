import { ProviderResponse } from '../../../types/threatIntel';
import { API_KEYS } from '../../../config/apiKeys';

export async function checkIP(ip: string): Promise<ProviderResponse> {
  try {
    const response = await fetch(`https://api.shodan.io/shodan/host/${ip}?key=${API_KEYS.SHODAN}`);
    if (!response.ok) {
      throw new Error(`Shodan API error: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      success: true,
      source: 'Shodan',
      malicious: false, // Shodan doesn't score, so always false
      score: 0,
      details: data,
      tags: data.tags || [],
    };
  } catch (error) {
    return {
      success: false,
      source: 'Shodan',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
