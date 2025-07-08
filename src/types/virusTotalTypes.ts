export interface AnalysisStats {
  harmless: number;
  malicious: number;
  suspicious: number;
  undetected: number;
  timeout: number;
}

export interface VirusTotalAnalysis {
  status: string;
  stats: AnalysisStats;
  results: {
    [engine: string]: {
      category: string;
      result: string | null;
      method: string;
      engine_name: string;
    };
  };
}

export interface VirusTotalIPAttributes {
  last_analysis_stats: AnalysisStats;
  country: string;
  asn: number;
  as_owner: string;
  tags: string[];
}

export interface VirusTotalHashAttributes {
  last_analysis_stats: AnalysisStats;
  type_description: string;
  size: number;
  md5: string;
  sha1: string;
  sha256: string;
  tags: string[];
}

export interface VirusTotalDomainAttributes {
  last_analysis_stats: AnalysisStats;
  registrar: string;
  creation_date: string;
  last_dns_records: Record<string, unknown>[];
  tags: string[];
}

export interface VirusTotalURLAttributes {
  last_analysis_stats: AnalysisStats;
  threat_names: string[];
  tags: string[];
  analysis_id: string;
}

export interface VirusTotalResponse<T> {
  data: {
    attributes: T;
  };
}
