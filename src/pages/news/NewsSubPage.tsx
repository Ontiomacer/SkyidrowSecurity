import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiClock, FiBookmark, FiShare2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import NewsCard from '@/components/news/NewsCard';
import { NewsFiltersSidebar } from '@/components/news/NewsFiltersSidebar';
import { useNewsAggregator, UnifiedNewsArticle } from '@/hooks/useNewsAggregator';
import { slugify } from './utils';
import NewsSkeleton from '@/components/skeletons/NewsSkeleton';

const NewsSubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<UnifiedNewsArticle | null>(null);
  const { id: routeArticleId } = useParams();
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [severity, setSeverity] = useState<("Critical" | "High" | "Moderate" | "Low")[]>([]);
  const [onlyWithIOCs, setOnlyWithIOCs] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [timelineMode, setTimelineMode] = useState(false);
  const itemsPerPage = 12;
  // Bookmarks: persist in localStorage
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('newsBookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  // Persist bookmarks to localStorage on change
  React.useEffect(() => {
    localStorage.setItem('newsBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);
  const [publishedArticles, setPublishedArticles] = useState<Array<{id: string, title: string, author: string, category: string, content: string, date: string}>>(() => {
    const saved = localStorage.getItem('publishedArticles');
    return saved ? JSON.parse(saved) : [];
  });
  const [pubTitle, setPubTitle] = useState('');
  const [pubAuthor, setPubAuthor] = useState('');
  const [pubCategory, setPubCategory] = useState('');
  const [pubContent, setPubContent] = useState('');
  const [pubSubmitted, setPubSubmitted] = useState(false);
  const navigate = useNavigate();
  const { news, loading, error } = useNewsAggregator({ dateFrom, dateTo, tags, sources, severity, onlyWithIOCs });

  // Live search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Search logic will be handled in filteredNews
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleDateFromChange = (v: string) => {
    setDateFrom(v);
    setCurrentPage(1);
  };

  const handleDateToChange = (v: string) => {
    setDateTo(v);
    setCurrentPage(1);
  };

  // Compose allNews from aggregator and published
  const allNews: UnifiedNewsArticle[] = React.useMemo(() => {
    // Create unique IDs for articles that don't have one
    const createUniqueId = (title: string, date: string) => {
      const baseSlug = slugify(title);
      const timestamp = new Date(date).getTime();
      return `${baseSlug}-${timestamp}`;
    };

    const publishedWithIds = publishedArticles.map(a => ({
      id: a.id || createUniqueId(a.title, a.date),
      title: a.title,
      author: a.author,
      date: a.date,
      category: a.category,
      link: '',
      image: '',
      summary: a.content,
      content: a.content,
      source: 'User',
      iocs: [],
      cves: [],
      severity: 'Low' as "Low",
      indicators: [],
      aiSummary: a.content.slice(0, 120) + (a.content.length > 120 ? '...' : ''),
    }));

    const aggregatorWithIds = news.map(n => ({
      ...n,
      id: n.id || createUniqueId(n.title, n.date)
    }));

    // Ensure no duplicate IDs
    const seen = new Set();
    const uniqueNews = [...publishedWithIds, ...aggregatorWithIds].filter(article => {
      if (seen.has(article.id)) {
        return false;
      }
      seen.add(article.id);
      return true;
    });

    return uniqueNews;
  }, [publishedArticles, news]);
  // Enhanced filtering
  const filteredNews = React.useMemo(() => {
    return allNews.filter(news => {
      const matchesSearch = search === '' ||
        news.title.toLowerCase().includes(search.toLowerCase()) ||
        news.summary.toLowerCase().includes(search.toLowerCase()) ||
        (news.content && news.content.toLowerCase().includes(search.toLowerCase()));
      
      const matchesTags = tags.length === 0 ||
        (news.category && tags.some(tag => 
          (news.category || '').toLowerCase().includes(tag.toLowerCase()) || 
          (news.summary || '').toLowerCase().includes(tag.toLowerCase())
        ));
      
      const matchesSeverity = severity.length === 0 || 
        (news.severity && severity.includes(news.severity as "Critical" | "High" | "Moderate" | "Low"));
      
      const matchesDate = !dateFrom || !dateTo || 
        (new Date(news.date) >= new Date(dateFrom) && 
         new Date(news.date) <= new Date(dateTo));
      
      return matchesSearch && matchesTags && matchesSeverity && matchesDate;
    });
  }, [allNews, search, tags, severity, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enhanced date formatting with relative time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recent';
    
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) // Less than a week
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Enhanced article selection with animation
  const handleSelectArticle = (article: UnifiedNewsArticle) => {
    if (!article.id) {
      // Create an ID if one doesn't exist
      article.id = slugify(`${article.title}-${new Date(article.date).getTime()}`);
    }
    setSelectedArticle(article);
    // Update URL with article ID and pass article state
    navigate(`/news/${encodeURIComponent(article.id)}`, { 
      state: { article },
      replace: true // Replace current history entry to prevent duplicate states
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When route param changes, update selectedArticle
  useEffect(() => {
    if (routeArticleId) {
      const found = allNews.find(n => n.id === routeArticleId);
      if (found) {
        setSelectedArticle(found);
      } else {
        setSelectedArticle(undefined as unknown as UnifiedNewsArticle); // special value for not found
      }
    } else {
      setSelectedArticle(null);
    }
  }, [routeArticleId, allNews]);

  // Handle publish news submit
  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newArticle = {
      id: slugify(pubTitle + Date.now()),
      title: pubTitle,
      author: pubAuthor,
      category: pubCategory,
      content: pubContent,
      date: new Date().toISOString()
    };
    const updated = [newArticle, ...publishedArticles];
    setPublishedArticles(updated);
    localStorage.setItem('publishedArticles', JSON.stringify(updated));
    setPubSubmitted(true);
    setTimeout(() => setPubSubmitted(false), 2000);
    setPubTitle('');
    setPubAuthor('');
    setPubCategory('');
    setPubContent('');
  };
  // Persist published articles to localStorage on change
  React.useEffect(() => {
    localStorage.setItem('publishedArticles', JSON.stringify(publishedArticles));
  }, [publishedArticles]);


  // Bookmarked articles
  const bookmarkedArticles = allNews.filter(n => bookmarks.includes(n.id));

  // Helper for toggling bookmarks
  const toggleBookmark = (id: string) => {
    setBookmarks(bm => bm.includes(id) ? bm.filter(bid => bid !== id) : [...bm, id]);
  };

  // Toast feedback (simple)
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1500);
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
          {/* Custom Tabs */}
          <div className="container mx-auto px-4 mb-6">
            <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1 border border-gray-700/50 max-w-max">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'all' 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                All News
              </button>
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'bookmarks' 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Bookmarks
              </button>
            </div>
          </div>

          <main className="container mx-auto py-4 px-4">
            {/* Toast Notification */}
            <AnimatePresence>
              {toast && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="fixed top-6 right-6 z-50 bg-blue-800 text-white px-6 py-3 rounded-xl shadow-lg"
                >
                  {toast}
                </motion.div>
              )}
            </AnimatePresence>

            {activeTab === 'bookmarks' ? (
              <section className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-blue-200 flex items-center gap-2">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5v14l7-7 7 7V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" /></svg>
                  Bookmarked Articles
                </h2>
                {bookmarkedArticles.length === 0 ? (
                  <div className="text-blue-300 text-lg text-center py-12">No bookmarks yet. Click the bookmark icon on any article to save it here.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarkedArticles.map(news => (
                      <div
                        key={news.id}
                        className="group relative flex flex-col bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
                        onClick={() => handleSelectArticle(news)}
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter') handleSelectArticle(news); }}
                        aria-label={`Read details for ${news.title}`}
                      >
                        <div className="relative overflow-hidden h-48">
                          <img
                            src={news.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80'}
                            alt={news.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={e => (e.currentTarget.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80')}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                          <span className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold shadow ${news.severity === 'Critical' ? 'bg-red-700 text-white' : news.severity === 'High' ? 'bg-orange-600 text-white' : news.severity === 'Moderate' ? 'bg-yellow-600 text-white' : 'bg-blue-700 text-white'}`}>{news.severity}</span>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{news.title}</h3>
                          <p className="text-blue-100/90 text-sm mb-2 font-light line-clamp-3">{news.aiSummary}</p>
                          <div className="mt-auto pt-4 border-t border-gray-700/50 flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-400 flex items-center">
                              {formatDate(news.date)}
                            </span>
                            <button
                              className={`text-xs px-2 py-1 rounded bg-yellow-500/80 text-white hover:bg-yellow-400/90 transition-colors ring-2 ring-yellow-300`}
                              onClick={e => { e.stopPropagation(); toggleBookmark(news.id); showToast('Removed from bookmarks'); }}
                              title="Remove Bookmark"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ) : activeTab === 'publish' ? (
              <section className="max-w-xl mx-auto">
                <form onSubmit={handlePublishSubmit} className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl p-8 flex flex-col gap-6 border border-blue-200/60 relative">
                  <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2 mb-2">
                    <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Publish News Article
                  </h2>
                  <div className="flex flex-col gap-2">
                    <label className="text-blue-900 font-semibold flex items-center gap-1" htmlFor="pub-title">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
                      Title
                    </label>
                    <input
                      id="pub-title"
                      type="text"
                      placeholder="e.g. Major Ransomware Attack Hits Healthcare"
                      value={pubTitle}
                      onChange={e => setPubTitle(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/40 bg-white text-blue-900 font-medium shadow-sm"
                      maxLength={120}
                      required
                    />
                    <div className="text-xs text-gray-500 text-right">{pubTitle.length}/120</div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-blue-900 font-semibold" htmlFor="pub-author">Author</label>
                      <input
                        id="pub-author"
                        type="text"
                        placeholder="e.g. Jane Doe"
                        value={pubAuthor}
                        onChange={e => setPubAuthor(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/40 bg-white text-blue-900 font-medium shadow-sm"
                        maxLength={40}
                        required
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-blue-900 font-semibold" htmlFor="pub-category">Category</label>
                      <input
                        id="pub-category"
                        type="text"
                        placeholder="e.g. Ransomware, Data Breach"
                        value={pubCategory}
                        onChange={e => setPubCategory(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/40 bg-white text-blue-900 font-medium shadow-sm"
                        maxLength={40}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-blue-900 font-semibold flex items-center gap-1" htmlFor="pub-content">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16h8M8 12h8m-8-4h8" /></svg>
                      Content <span className="text-xs text-gray-400 ml-2">(Markdown supported)</span>
                    </label>
                    <textarea
                      id="pub-content"
                      placeholder="Write your news article here..."
                      value={pubContent}
                      onChange={e => setPubContent(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/40 bg-white text-blue-900 font-medium shadow-sm min-h-[120px] resize-vertical"
                      maxLength={2000}
                      required
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        Supports{' '}
                        <a
                          href="https://www.markdownguide.org/cheat-sheet/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          Markdown
                        </a>
                      </span>
                      <span>{pubContent.length}/2000</span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all text-lg mt-2"
                  >
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Publish News
                    </span>
                  </button>
                  {pubSubmitted && <div className="text-green-600 font-semibold text-center mt-2 animate-pulse">News published successfully!</div>}
                </form>
                {/* Published News List */}
                {publishedArticles.length > 0 && (
                  <section className="mt-10">
                    <h2 className="text-2xl font-bold mb-4 text-blue-900 flex items-center gap-2">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h5l2-2h5a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>
                      Published News
                    </h2>
                    <div className="space-y-6">
                      {publishedArticles.map((article, idx) => (
                        <div key={article.id} className="bg-white border border-blue-200 rounded-xl shadow-lg p-5 flex flex-col gap-2 relative">
                          <h3 className="text-xl font-bold text-blue-800 mb-1 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            {article.title}
                          </h3>
                          <div className="text-xs text-gray-500 mb-2">By {article.author} | {article.category} | {formatDate(article.date)}</div>
                          <p className="text-gray-800 whitespace-pre-line text-base leading-relaxed">{article.content}</p>
                          <button
                            className={`self-end mt-2 text-xs px-3 py-1 rounded-lg bg-blue-800/80 text-white hover:bg-blue-600/90 transition-colors shadow ${bookmarks.includes(article.id) ? 'ring-2 ring-blue-400' : ''}`}
                            onClick={() => setBookmarks(bm => bm.includes(article.id) ? bm.filter(id => id !== article.id) : [...bm, article.id])}
                            title={bookmarks.includes(article.id) ? 'Remove Bookmark' : 'Bookmark'}
                          >
                            {bookmarks.includes(article.id) ? 'Bookmarked' : 'Bookmark'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </section>
            ) : (
              <>
                {/* Timeline toggle and bookmarks */}
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
                    {filteredNews.map((news) => (
                      <div
                        key={news.id}
                        className="group relative flex flex-col bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
                        onClick={() => handleSelectArticle(news)}
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter') handleSelectArticle(news); }}
                        aria-label={`Read details for ${news.title}`}
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
                                className={`text-xs px-2 py-1 rounded ${bookmarks.includes(news.id) ? 'bg-yellow-500/80 text-white ring-2 ring-yellow-300' : 'bg-blue-800/60 text-white hover:bg-blue-600/80'} transition-colors`}
                                onClick={e => {
                                  e.stopPropagation();
                                  toggleBookmark(news.id);
                                  showToast(bookmarks.includes(news.id) ? 'Removed from bookmarks' : 'Added to bookmarks');
                                }}
                                title={bookmarks.includes(news.id) ? 'Remove Bookmark' : 'Bookmark'}
                              >
                                {bookmarks.includes(news.id) ? (
                                  <span className="inline-flex items-center gap-1"><svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v12l7-4 7 4V5a2 2 0 00-2-2H5z" /></svg> Bookmarked</span>
                                ) : 'Bookmark'}
                              </button>
                              <button
                                className="text-xs px-2 py-1 rounded bg-gray-700/60 text-white hover:bg-gray-600/80 transition-colors"
                                onClick={e => {
                                  e.stopPropagation();
                                  if (news.link && news.link !== '') {
                                    window.open(news.link, '_blank');
                                  } else {
                                    // If no link, open details view
                                    handleSelectArticle(news);
                                  }
                                }}
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
                      {filteredNews.map((news) => (
                        <div key={news.id} className="min-w-[340px] max-w-xs bg-gray-800/60 rounded-xl border border-gray-700/50 p-4 flex flex-col relative">
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
                              className={`text-xs px-2 py-1 rounded ${bookmarks.includes(news.id) ? 'bg-yellow-500/80 text-white ring-2 ring-yellow-300' : 'bg-blue-800/60 text-white hover:bg-blue-600/80'} transition-colors`}
                              onClick={e => {
                                e.stopPropagation();
                                toggleBookmark(news.id);
                                showToast(bookmarks.includes(news.id) ? 'Removed from bookmarks' : 'Added to bookmarks');
                              }}
                              title={bookmarks.includes(news.id) ? 'Remove Bookmark' : 'Bookmark'}
                            >
                              {bookmarks.includes(news.id) ? (
                                <span className="inline-flex items-center gap-1"><svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v12l7-4 7 4V5a2 2 0 00-2-2H5z" /></svg> Bookmarked</span>
                              ) : 'Bookmark'}
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
              </>
            )}
            {/* News Details Tab */}
            {selectedArticle === undefined ? (
              <section className="max-w-2xl mx-auto bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 rounded-2xl shadow-2xl border border-blue-700/40 mt-10 animate-fade-in overflow-hidden flex flex-col items-center justify-center p-12">
                <div className="text-2xl text-blue-200 font-bold mb-4">Article not found</div>
                <button
                  className="mt-2 px-6 py-2 rounded-lg bg-blue-700 text-white font-semibold shadow hover:bg-blue-600 transition"
                  onClick={() => navigate('/news')}
                >
                  ← Back to News
                </button>
              </section>
            ) : selectedArticle && (
              <section className="max-w-5xl mx-auto bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 rounded-2xl shadow-2xl border border-blue-700/40 mt-10 animate-fade-in overflow-hidden">
                {/* News Article Header */}
                <div className="relative flex flex-col md:flex-row gap-0 md:gap-8">
                  {selectedArticle.image && (
                    <img
                      src={selectedArticle.image}
                      alt={selectedArticle.title}
                      className="w-full md:w-2/5 h-80 object-cover object-center bg-gray-900 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
                      style={{ filter: 'brightness(0.92)' }}
                    />
                  )}
                  <div className="flex-1 flex flex-col justify-between p-8">
                    <div>
                      <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg leading-tight mb-2">
                        {selectedArticle.title}
                      </h1>
                      {selectedArticle.aiSummary && (
                        <h2 className="text-xl md:text-2xl font-medium text-blue-100/90 drop-shadow mb-1 max-w-3xl">
                          {selectedArticle.aiSummary}
                        </h2>
                      )}
                      <div className="flex items-center gap-3 text-blue-200/90 text-sm flex-wrap mt-2 mb-4">
                        <span className="font-semibold">{selectedArticle.author}</span>
                        <span>•</span>
                        <span>{formatDate(selectedArticle.date)}</span>
                        {selectedArticle.category && <><span>•</span><span>{selectedArticle.category}</span></>}
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-bold shadow ${selectedArticle.severity === 'Critical' ? 'bg-red-700 text-white' : selectedArticle.severity === 'High' ? 'bg-orange-600 text-white' : selectedArticle.severity === 'Moderate' ? 'bg-yellow-600 text-white' : 'bg-blue-700 text-white'}`}>{selectedArticle.severity}</span>
                      </div>
                    </div>
                    <button
                      className="mt-6 w-max px-6 py-2 rounded-lg bg-blue-700 text-white font-semibold shadow hover:bg-blue-600 transition"
                      onClick={() => {
                        setSelectedArticle(null);
                        navigate('/news');
                      }}
                    >
                      ← Back to News
                    </button>
                  </div>
                </div>
                {/* Article Body */}
                <div className="px-8 py-10 md:py-14 flex flex-col gap-8 bg-gray-950/80">
                  <div className="prose prose-lg dark:prose-invert max-w-none text-blue-100 text-xl leading-relaxed whitespace-pre-line">
                    {selectedArticle.content || selectedArticle.summary}
                  </div>
                  {/* IOCs and CVEs */}
                  {(selectedArticle.cves.length > 0 || selectedArticle.iocs.length > 0) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedArticle.cves.map(cve => <span key={cve} className="bg-red-900/80 text-red-200 px-2 py-0.5 rounded text-xs font-mono">{cve}</span>)}
                      {selectedArticle.iocs.map(ioc => <span key={ioc} className="bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded text-xs font-mono">{ioc}</span>)}
                    </div>
                  )}
                  {selectedArticle.link && selectedArticle.link !== '#' && (
                    <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer" className="inline-block text-blue-400 underline font-semibold text-lg mt-4">Read original source</a>
                  )}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default NewsSubPage;
