

export interface SerpApiNewsArticle {
  title: string;
  link: string;
  snippet: string;
  source: string;
  date: string;
  image?: string;
}

export async function fetchSerpApiNews(query: string, _apiKey: string, num: number = 6): Promise<SerpApiNewsArticle[]> {
  // Use backend proxy to avoid CORS
  const url = `/api/serpapi-news?q=${encodeURIComponent(query)}&num=${num}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Proxy SerpAPI request failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const newsResults = data.news_results || [];
    return newsResults.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: item.source,
      date: item.date,
      image: item.thumbnail,
    }));
  } catch (error) {
    console.error('Error fetching SerpAPI news via proxy:', error);
    return [];
  }
}
