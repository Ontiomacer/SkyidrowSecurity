import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { useNavigate } from 'react-router-dom';
import { useNewsAggregator, UnifiedNewsArticle } from '@/hooks/useNewsAggregator';

const BookmarkedNewsSubPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('newsBookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  // Only show bookmarked articles, ignore all others
  // We must ensure we only use bookmarks that exist in the news aggregator
  const { news, loading, error } = useNewsAggregator({});
  const bookmarkedArticles = news.filter(n => bookmarks.includes(n.id));

  // Defensive: If news aggregator returns all news, but bookmarks are not unique, filter strictly by bookmarks order
  // This ensures only bookmarked articles, in the order they were bookmarked, are shown
  const orderedBookmarkedArticles = bookmarks
    .map(id => news.find(n => n.id === id))
    .filter(Boolean) as UnifiedNewsArticle[];
  const navigate = useNavigate();

  // For details view
  const [selectedArticle, setSelectedArticle] = useState<UnifiedNewsArticle | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-950 flex flex-col">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-1">
        <h1 className="text-3xl font-bold text-blue-200 mb-8">Bookmarked News</h1>
        {selectedArticle ? (
          <section className="max-w-4xl mx-auto bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-blue-700/40 mt-10 animate-fade-in overflow-hidden">
            <button
              className="mt-4 ml-4 text-blue-400 hover:underline text-sm self-start"
              onClick={() => setSelectedArticle(null)}
            >
              ← Back to Bookmarks
            </button>
            <div className="px-8 py-10 md:py-14 flex flex-col gap-6">
              <h1 className="text-4xl font-extrabold text-blue-900 dark:text-blue-100 mb-2">{selectedArticle.title}</h1>
              <div className="flex items-center gap-3 text-blue-400 text-sm flex-wrap mb-4">
                <span className="font-semibold">{selectedArticle.author}</span>
                <span>•</span>
                <span>{new Date(selectedArticle.date).toLocaleDateString()}</span>
                {selectedArticle.category && <><span>•</span><span>{selectedArticle.category}</span></>}
                <span className={`ml-2 px-2 py-1 rounded text-xs font-bold shadow ${selectedArticle.severity === 'Critical' ? 'bg-red-700 text-white' : selectedArticle.severity === 'High' ? 'bg-orange-600 text-white' : selectedArticle.severity === 'Moderate' ? 'bg-yellow-600 text-white' : 'bg-blue-700 text-white'}`}>{selectedArticle.severity}</span>
              </div>
              {selectedArticle.image && (
                <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-64 object-cover rounded mb-4 bg-gray-800" />
              )}
              <p className="text-blue-100 mb-4 whitespace-pre-line break-words text-lg leading-relaxed">{selectedArticle.content || selectedArticle.summary}</p>
              {(selectedArticle.cves.length > 0 || selectedArticle.iocs.length > 0) && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {selectedArticle.cves.map(cve => <span key={cve} className="bg-red-900/80 text-red-200 px-2 py-0.5 rounded text-xs font-mono">{cve}</span>)}
                  {selectedArticle.iocs.map(ioc => <span key={ioc} className="bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded text-xs font-mono">{ioc}</span>)}
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            {orderedBookmarkedArticles.length === 0 ? (
              <div className="text-blue-300 text-lg text-center py-12">No bookmarks yet. Bookmark news articles to see them here.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {orderedBookmarkedArticles.map(news => (
                  <div
                    key={news.id}
                    className="group relative flex flex-col bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
                    onClick={() => setSelectedArticle(news)}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter') setSelectedArticle(news); }}
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
                          {new Date(news.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {loading && <div className="text-blue-300 text-base flex items-center gap-2 justify-center py-8">Loading news...</div>}
        {error && <div className="text-red-400 text-base text-center py-8">{error}</div>}
      </main>
    </div>
  );
};

export default BookmarkedNewsSubPage;
