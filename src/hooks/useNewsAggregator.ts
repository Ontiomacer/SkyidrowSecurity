import { useEffect, useState } from 'react';
import { fetchGuardianNews } from '@/services/GuardianNewsService';
import cybernewsArticles from '@/services/cybernews_articles.json';

export interface UnifiedNewsArticle {
  id: string;
  title: string;
  author: string;
  date: string;
  category?: string;
  link: string;
  image?: string;
  summary: string;
  content: string;
  source: string;
  iocs: string[];
  cves: string[];
  severity: 'Critical' | 'High' | 'Moderate' | 'Low';
  indicators: string[];
  aiSummary: string;
}

// RSS_FEEDS now handled by backend

const CVE_REGEX = /CVE-\d{4}-\d+/gi;
const IP_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const DOMAIN_REGEX = /\b([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b/g;
const HASH_REGEX = /\b[a-fA-F0-9]{32,64}\b/g;

function extractIndicators(text: string): { cves: string[]; iocs: string[] } {
  const cves = Array.from(new Set((text.match(CVE_REGEX) || [])));
  const ips = Array.from(new Set((text.match(IP_REGEX) || [])));
  const domains = Array.from(new Set((text.match(DOMAIN_REGEX) || [])));
  const hashes = Array.from(new Set((text.match(HASH_REGEX) || [])));
  const iocs = [...ips, ...domains, ...hashes];
  return { cves, iocs };
}

function fakeAISummary(text: string): string {
  // Placeholder for AI summary (2-3 lines)
  if (!text) return '';
  return text.split('. ').slice(0, 2).join('. ') + (text.includes('.') ? '.' : '');
}

function computeSeverity(article: UnifiedNewsArticle): UnifiedNewsArticle['severity'] {
  if (article.cves.length > 0) return 'Critical';
  if (/ransomware|zero-day|apt|exploit/i.test(article.title + article.summary)) return 'High';
  if (/malware|phishing|breach/i.test(article.title + article.summary)) return 'Moderate';
  return 'Low';
}

export function useNewsAggregator(filters: {
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  sources?: string[];
  severity?: UnifiedNewsArticle['severity'][];
  onlyWithIOCs?: boolean;
}) {
  const [news, setNews] = useState<UnifiedNewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      let all: UnifiedNewsArticle[] = [];
      try {
        // Guardian
        const guardian = await fetchGuardianNews({ q: 'cybersecurity OR threat OR malware OR ransomware', pageSize: 10 });
        all = all.concat(guardian.map(article => {
          const { cves, iocs } = extractIndicators(article.fields?.bodyText || '');
          return {
            id: article.id,
            title: article.webTitle,
            author: article.sectionName || 'The Guardian',
            date: article.webPublicationDate,
            category: article.sectionName,
            link: article.webUrl,
            image: article.fields?.thumbnail,
            summary: article.fields?.trailText || '',
            content: article.fields?.bodyText || article.webTitle,
            source: 'Guardian',
            cves,
            iocs,
            indicators: [...cves, ...iocs],
            aiSummary: fakeAISummary(article.fields?.bodyText || ''),
            severity: 'Low', // will update below
          };
        }));
        // CyberNews
        all = all.concat((cybernewsArticles as any[]).map(a => {
          const { cves, iocs } = extractIndicators(a.summary || a.content || '');
          // Use the same encoding as backend for id
          const id = a.link ? encodeURIComponent(a.link) : encodeURIComponent(a.title);
          return {
            id,
            title: a.title,
            author: a.source || 'CyberNews',
            date: a.date,
            category: 'Cyber Security',
            link: a.link || '',
            image: a.image,
            summary: a.summary,
            content: a.summary + (a.content && a.content !== a.summary ? '\n\n' + a.content : ''),
            source: 'CyberNews',
            cves,
            iocs,
            indicators: [...cves, ...iocs],
            aiSummary: fakeAISummary(a.summary),
            severity: 'Low',
          };
        }));
        // RSS (via backend)
        try {
          const rssRes = await fetch('/api/rss-news');
          const rssData = await rssRes.json();
          // PATCH: backend returns articles not items
          if (rssData.success && Array.isArray(rssData.articles)) {
            all = all.concat(rssData.articles.map(item => {
              const { cves, iocs } = extractIndicators(item.content || item.summary || '');
              return {
                id: item.id,
                title: item.title,
                author: item.author || item.source || 'CyberNews',
                date: item.date || item.fetched_at || '',
                category: item.category || 'Cyber Security',
                link: item.link || '',
                image: item.image,
                summary: item.summary,
                content: item.content || item.summary,
                source: item.source || 'CyberNews',
                cves,
                iocs,
                indicators: [...cves, ...iocs],
                aiSummary: fakeAISummary(item.content || item.summary || ''),
                severity: 'Low',
              };
            }));
          }
        } catch (e) {
          // Ignore RSS errors for now
        }
        // Compute severity
        all = all.map(a => ({ ...a, severity: computeSeverity(a) }));
        // Filter
        if (filters.dateFrom) {
          all = all.filter(a => new Date(a.date) >= new Date(filters.dateFrom!));
        }
        if (filters.dateTo) {
          all = all.filter(a => new Date(a.date) <= new Date(filters.dateTo!));
        }
        if (filters.tags && filters.tags.length > 0) {
          all = all.filter(a => filters.tags!.some(tag => (a.category || '').toLowerCase().includes(tag.toLowerCase()) || a.summary.toLowerCase().includes(tag.toLowerCase())));
        }
        if (filters.sources && filters.sources.length > 0) {
          all = all.filter(a => filters.sources!.includes(a.source));
        }
        if (filters.severity && filters.severity.length > 0) {
          all = all.filter(a => filters.severity!.includes(a.severity));
        }
        if (filters.onlyWithIOCs) {
          all = all.filter(a => a.cves.length > 0 || a.iocs.length > 0);
        }
        // Sort by date desc
        all = all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNews(all);
      } catch (e) {
        setError('Failed to aggregate news.');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return { news, loading, error };
}
