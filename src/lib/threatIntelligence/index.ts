import { QueryType, ThreatIntelligenceResponse, ProviderResponse } from '../../types/threatIntel';
import { detectQueryType } from '../utils/queryDetector';
import * as VirusTotal from './providers/virusTotal';
import * as AbuseIPDB from './providers/abuseIPDB';
import * as Shodan from './providers/shodan';
import * as URLScan from './providers/urlScan';
import * as NVD from './providers/nvd';

export async function getThreatIntelligence(
  query: string,
  type?: QueryType
): Promise<ThreatIntelligenceResponse> {
  try {
    const detectedType = type || detectQueryType(query);
    if (!detectedType) {
      return {
        success: false,
        data: null,
        error: 'Invalid query format',
      };
    }

    const providers = getProvidersForType(detectedType);
    const responses = await Promise.all(
      providers.map((provider) => provider(query))
    );

    const validResponses = responses.filter((r) => r.success);
    if (validResponses.length === 0) {
      return {
        success: false,
        data: null,
        error: 'No data available from any provider',
      };
    }

    return normalizeResponses(query, detectedType, validResponses);
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

function getProvidersForType(type: QueryType): Array<(query: string) => Promise<ProviderResponse>> {
  switch (type) {
    case 'ip':
      return [VirusTotal.checkIP, Shodan.checkIP];
    case 'hash':
      return [VirusTotal.checkHash];
    case 'domain':
      return [VirusTotal.checkDomain];
    case 'url':
      return [VirusTotal.checkURL, URLScan.checkURL];
    case 'cve':
      return [NVD.checkCVE];
    default:
      return [];
  }
}

function normalizeResponses(
  query: string,
  type: QueryType,
  responses: ProviderResponse[]
): ThreatIntelligenceResponse {
  const sources = responses.map((r) => r.source);
  const maliciousCount = responses.filter((r) => r.malicious).length;
  const overallMalicious = maliciousCount > 0;
  const avgScore = responses.reduce((acc, r) => acc + (r.score || 0), 0) / responses.length;

  return {
    success: true,
    data: {
      type,
      query,
      sources,
      malicious: overallMalicious,
      score: Math.round(avgScore * 100) / 100,
      lastAnalysisDate: new Date().toISOString(),
      details: responses.reduce((acc, r) => ({
        ...acc,
        [r.source]: r.details
      }), {}),
      tags: Array.from(new Set(responses.flatMap((r) => r.tags || [])))
    }
  };
}
