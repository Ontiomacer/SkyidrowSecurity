
export interface OSINTQuery {
  id: string;
  userId: string;
  tool: 'virustotal' | 'abusech' | 'shodan' | 'whois' | 'urlscan';
  query: string;
  timestamp: Date;
  success: boolean;
  responseTime?: number;
  errorMessage?: string;
}

export interface OSINTResult {
  id: string;
  queryId: string;
  data: any;
  metadata: {
    source: string;
    timestamp: Date;
    confidence?: number;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'github';
  accessToken: string;
  createdAt: Date;
}

export interface APIUsageStats {
  userId: string;
  tool: string;
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  rateLimitsHit: number;
  lastUsed: Date;
}
