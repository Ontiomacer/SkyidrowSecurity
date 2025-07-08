import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import NewsTabs from '@/components/news/NewsTabs';
import { NewsFiltersSidebar } from '@/components/news/NewsFiltersSidebar';
import { useNewsAggregator, UnifiedNewsArticle } from '@/hooks/useNewsAggregator';
import { slugify } from './utils';




const NewsSubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('main');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [severity, setSeverity] = useState<("Critical" | "High" | "Moderate" | "Low")[]>([]);
  const [onlyWithIOCs, setOnlyWithIOCs] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timelineMode, setTimelineMode] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const navigate = useNavigate();
  const { news, loading, error } = useNewsAggregator({ dateFrom, dateTo, tags, sources, severity, onlyWithIOCs });


  // Live search: update as you type
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleDateFromChange = (v: string) => setDateFrom(v);
  const handleDateToChange = (v: string) => setDateTo(v);

  // Removed unused handleFilterSubmit and related legacy code from previous implementation


  // Compose allNews from aggregator
  const allNews: UnifiedNewsArticle[] = news;
  // Final filteredNews: search and tags
  const filteredNews = allNews.filter(news => {
    const matchesSearch = search === '' ||
      news.title.toLowerCase().includes(search.toLowerCase()) ||
      news.summary.toLowerCase().includes(search.toLowerCase());
    const matchesTags = tags.length === 0 ||
      (news.category && tags.some(tag => (news.category || '').toLowerCase().includes(tag.toLowerCase()) || news.summary.toLowerCase().includes(tag.toLowerCase())));
    return matchesSearch && matchesTags;
  });

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Recent'
      : date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-950 flex">
      {/* Sidebar */}
      <NewsFiltersSidebar
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFrom={handleDateFromChange}
        onDateTo={handleDateToChange}
        tags={tags}
        setTags={setTags}
        sources={sources}
        setSources={setSources}
        severity={severity}
        setSeverity={setSeverity}
        onlyWithIOCs={onlyWithIOCs}
        setOnlyWithIOCs={setOnlyWithIOCs}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col">
        <Header />
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-900/30 to-blue-950/50 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070')] opacity-5 bg-cover bg-center"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Threat Intelligence <span className="text-blue-400">News</span>
              </h1>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Stay updated with the latest cybersecurity news and threats
              </p>
            </div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search threat intel..."
                className="block w-full pl-10 pr-10 py-3 border border-blue-800/50 rounded-xl bg-gray-900/80 text-white placeholder-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                aria-label="Search threat intelligence news"
                style={{ boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.2)' }}
              />
            </div>
          </div>
        </div>
        <div className="relative z-10">
          <NewsTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <main className="container mx-auto py-8 px-4">
            {/* Timeline toggle */}
            <div className="flex items-center gap-4 mb-6">
              <button
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${timelineMode ? 'bg-blue-700 text-white border-blue-400' : 'bg-gray-800 text-blue-200 border-blue-900/30'}`}
                onClick={() => setTimelineMode(!timelineMode)}
              >
                {timelineMode ? 'Card Mode' : 'Timeline Mode'}
              </button>
              <button
                className="px-3 py-1 rounded-full text-xs font-semibold border bg-gray-800 text-blue-200 border-blue-900/30"
                onClick={() => setBookmarks([])}
                title="Clear bookmarks"
              >
                Clear Bookmarks
              </button>
            </div>
            {/* News Grid or Timeline */}
            {!timelineMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map((news, index) => (
                  <div
                    key={news.id || index}
                    className="group relative flex flex-col bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
                  >
                    {/* News Image */}
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={news.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80'}
                        alt={news.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={e => (e.currentTarget.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80')}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {/* Severity badge */}
                      <span className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold shadow ${news.severity === 'Critical' ? 'bg-red-700 text-white' : news.severity === 'High' ? 'bg-orange-600 text-white' : news.severity === 'Moderate' ? 'bg-yellow-600 text-white' : 'bg-blue-700 text-white'}`}>{news.severity}</span>
                    </div>
                    {/* News Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                        {news.title}
                      </h3>
                      <p className="text-blue-100/90 text-sm mb-2 font-light line-clamp-3">
                        {news.aiSummary}
                      </p>
                      {/* IOCs/CVEs */}
                      {(news.cves.length > 0 || news.iocs.length > 0) && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {news.cves.map(cve => <span key={cve} className="bg-red-900/80 text-red-200 px-2 py-0.5 rounded text-xs font-mono">{cve}</span>)}
                          {news.iocs.map(ioc => <span key={ioc} className="bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded text-xs font-mono">{ioc}</span>)}
                        </div>
                      )}
                      <div className="mt-auto pt-4 border-t border-gray-700/50 flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-400 flex items-center">
                          <svg className="w-3 h-3 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(news.date)}
                        </span>
                        <div className="flex gap-2">
                          <button
                            className={`text-xs px-2 py-1 rounded bg-blue-800/60 text-white hover:bg-blue-600/80 transition-colors ${bookmarks.includes(news.id) ? 'ring-2 ring-blue-400' : ''}`}
                            onClick={() => setBookmarks(bm => bm.includes(news.id) ? bm.filter(id => id !== news.id) : [...bm, news.id])}
                            title={bookmarks.includes(news.id) ? 'Remove Bookmark' : 'Bookmark'}
                          >
                            {bookmarks.includes(news.id) ? 'Bookmarked' : 'Bookmark'}
                          </button>
                          <button
                            className="text-xs px-2 py-1 rounded bg-gray-700/60 text-white hover:bg-gray-600/80 transition-colors"
                            onClick={() => window.open(news.link, '_blank')}
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="flex gap-6 py-4">
                  {filteredNews.map((news, index) => (
                    <div key={news.id || index} className="min-w-[340px] max-w-xs bg-gray-800/60 rounded-xl border border-gray-700/50 p-4 flex flex-col relative">
                      <span className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold shadow ${news.severity === 'Critical' ? 'bg-red-700 text-white' : news.severity === 'High' ? 'bg-orange-600 text-white' : news.severity === 'Moderate' ? 'bg-yellow-600 text-white' : 'bg-blue-700 text-white'}`}>{news.severity}</span>
                      <h3 className="text-base font-bold text-white mb-1 line-clamp-2">{news.title}</h3>
                      <p className="text-blue-100/90 text-xs mb-2 font-light line-clamp-3">{news.aiSummary}</p>
                      {(news.cves.length > 0 || news.iocs.length > 0) && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {news.cves.map(cve => <span key={cve} className="bg-red-900/80 text-red-200 px-2 py-0.5 rounded text-xs font-mono">{cve}</span>)}
                          {news.iocs.map(ioc => <span key={ioc} className="bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded text-xs font-mono">{ioc}</span>)}
                        </div>
                      )}
                      <div className="mt-auto pt-2 border-t border-gray-700/50 flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-400 flex items-center">
                          {formatDate(news.date)}
                        </span>
                        <button
                          className={`text-xs px-2 py-1 rounded bg-blue-800/60 text-white hover:bg-blue-600/80 transition-colors ${bookmarks.includes(news.id) ? 'ring-2 ring-blue-400' : ''}`}
                          onClick={() => setBookmarks(bm => bm.includes(news.id) ? bm.filter(id => id !== news.id) : [...bm, news.id])}
                          title={bookmarks.includes(news.id) ? 'Remove Bookmark' : 'Bookmark'}
                        >
                          {bookmarks.includes(news.id) ? 'Bookmarked' : 'Bookmark'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Error/Loading */}
            {loading && <div className="text-blue-300 text-base flex items-center gap-2 justify-center py-8">Loading news...</div>}
            {error && <div className="text-red-400 text-base text-center py-8">{error}</div>}
          </main>
        </div>
      </div>
    </div>
  );
};

export default NewsSubPage;
