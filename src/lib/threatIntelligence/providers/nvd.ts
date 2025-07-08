import { ProviderResponse } from '../../../types/threatIntel';
import { API_KEYS } from '../../../config/apiKeys';

export async function checkCVE(cve: string): Promise<ProviderResponse> {
  try {
    // Use backend proxy to avoid CORS
    const response = await fetch(`/api/nvd-cve?cveId=${encodeURIComponent(cve)}`);
    if (!response.ok) {
      throw new Error(`NVD API error: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      success: true,
      source: 'NVD',
      malicious: false, // NVD doesn't score, so always false
      score: 0,
      details: data,
      tags: data.result?.CVE_Items?.[0]?.cve?.problemtype?.problemtype_data?.[0]?.description?.map((d: any) => d.value) || [],
    };
  } catch (error) {
    return {
      success: false,
      source: 'NVD',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
