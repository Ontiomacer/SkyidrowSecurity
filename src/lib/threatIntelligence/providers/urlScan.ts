import { ProviderResponse } from '../../../types/threatIntel';
import { API_KEYS } from '../../../config/apiKeys';

export async function checkURL(url: string): Promise<ProviderResponse> {
  try {
    const response = await fetch('https://urlscan.io/api/v1/scan/', {
      method: 'POST',
      headers: {
        'API-Key': API_KEYS.URLSCAN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) {
      throw new Error(`URLScan API error: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      success: true,
      source: 'URLScan',
      malicious: false, // URLScan doesn't score, so always false
      score: 0,
      details: data,
      tags: [],
    };
  } catch (error) {
    return {
      success: false,
      source: 'URLScan',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
