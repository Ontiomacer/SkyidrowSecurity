import { API_KEYS } from '@/config/apiKeys';

export interface GuardianNewsArticle {
  id: string;
  webTitle: string;
  webUrl: string;
  webPublicationDate: string;
  sectionName: string;
  fields?: {
    thumbnail?: string;
    trailText?: string;
    bodyText?: string;
  };
}

export interface GuardianNewsResponse {
  response: {
    status: string;
    results: GuardianNewsArticle[];
  };
}

const GUARDIAN_API_URL = 'https://content.guardianapis.com/search';

export async function fetchGuardianNews({
  q = 'cyber security',
  pageSize = 6,
  section = '',
  orderBy = 'newest',
}: {
  q?: string;
  pageSize?: number;
  section?: string;
  orderBy?: string;
} = {}): Promise<GuardianNewsArticle[]> {
  const params = new URLSearchParams({
    'api-key': API_KEYS.Guardian_API_KEY,
    'q': q,
    'page-size': String(pageSize),
    'show-fields': 'thumbnail,trailText,bodyText',
    'order-by': orderBy,
  });
  if (section) params.append('section', section);

  const url = `${GUARDIAN_API_URL}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch Guardian news');
  const data: GuardianNewsResponse = await res.json();
  return data.response.results;
}
