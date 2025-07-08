
import { OSINTQuery, APIUsageStats } from '@/types/osint';

export class UsageTrackingService {
  private queries: OSINTQuery[] = [];
  private stats: Map<string, APIUsageStats> = new Map();

  logQuery(query: OSINTQuery): void {
    this.queries.push(query);
    this.updateStats(query);
    
    // Store in localStorage for persistence
    localStorage.setItem('osint_queries', JSON.stringify(this.queries));
    localStorage.setItem('osint_stats', JSON.stringify(Array.from(this.stats.entries())));
    
    console.log('Query logged:', query);
  }

  private updateStats(query: OSINTQuery): void {
    const key = `${query.userId}_${query.tool}`;
    const existing = this.stats.get(key) || {
      userId: query.userId,
      tool: query.tool,
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      rateLimitsHit: 0,
      lastUsed: query.timestamp
    };

    existing.totalQueries++;
    if (query.success) {
      existing.successfulQueries++;
    } else {
      existing.failedQueries++;
      if (query.errorMessage?.includes('rate limit')) {
        existing.rateLimitsHit++;
      }
    }
    existing.lastUsed = query.timestamp;

    this.stats.set(key, existing);
  }

  getUserStats(userId: string): APIUsageStats[] {
    return Array.from(this.stats.values()).filter(stat => stat.userId === userId);
  }

  getUserQueries(userId: string, limit: number = 50): OSINTQuery[] {
    return this.queries
      .filter(query => query.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getToolUsage(tool: string): number {
    return this.queries.filter(query => query.tool === tool).length;
  }

  getSuccessRate(userId: string, tool?: string): number {
    const userQueries = this.queries.filter(query => {
      return query.userId === userId && (tool ? query.tool === tool : true);
    });

    if (userQueries.length === 0) return 0;

    const successfulQueries = userQueries.filter(query => query.success).length;
    return (successfulQueries / userQueries.length) * 100;
  }

  loadFromStorage(): void {
    try {
      const queriesData = localStorage.getItem('osint_queries');
      const statsData = localStorage.getItem('osint_stats');

      if (queriesData) {
        this.queries = JSON.parse(queriesData).map((q: any) => ({
          ...q,
          timestamp: new Date(q.timestamp)
        }));
      }

      if (statsData) {
        const statsArray = JSON.parse(statsData);
        this.stats = new Map(statsArray.map(([key, value]: [string, any]) => [
          key,
          { ...value, lastUsed: new Date(value.lastUsed) }
        ]));
      }
    } catch (error) {
      console.error('Failed to load usage data from storage:', error);
    }
  }
}

export const usageTrackingService = new UsageTrackingService();
