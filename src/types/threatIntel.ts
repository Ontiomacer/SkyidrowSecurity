export type QueryType = 'ip' | 'hash' | 'domain' | 'url' | 'cve';

export interface ThreatIntelligenceResponse {
  success: boolean;
  data: ThreatData | null;
  error?: string;
}

export interface ThreatData {
  type: QueryType;
  query: string;
  sources: string[];
  malicious: boolean;
  score: number;
  lastAnalysisDate?: string;
  details: Record<string, unknown>;
  tags: string[];
}

export interface ProviderResponse {
  success: boolean;
  source: string;
  data?: unknown;
  error?: string;
  malicious?: boolean;
  score?: number;
  details?: Record<string, unknown>;
  tags?: string[];
}

export interface ProviderConfig {
  name: string;
  apiKey: string;
  baseUrl: string;
  supportedTypes: QueryType[];
}
