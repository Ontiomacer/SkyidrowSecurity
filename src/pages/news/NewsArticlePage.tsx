import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import cybernewsArticles from '@/services/cybernews_articles.json';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { GuardianNewsArticle } from '@/services/GuardianNewsService';
import { slugify } from './utils';
import { useNewsAggregator } from '@/hooks/useNewsAggregator';

// Unified news type
interface UnifiedNews {
  id?: string;
  title: string;
  author: string;
  date: string;
  category?: string;
  link?: string;
  image?: string;
  summary: string;
  content: string;
  isLive?: boolean;
}

// Helper to get all news (Guardian + CyberNews + static)


const NewsArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Try to get article from location state first
  const stateArticle = location.state?.article;
  const { news: allNews } = useNewsAggregator({});

  // If no state article, try to find it in all news
  const article = useMemo(() => {
    if (stateArticle) return stateArticle;
    if (!id) return undefined;
    // Look for article in all news sources
    return allNews.find(a => a.id === id || slugify(a.title) === id);
  }, [id, stateArticle, allNews]);

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-blue-200">
          <div className="text-2xl font-bold mb-4">Article not found</div>
          <button
            className="px-6 py-2 rounded-lg bg-blue-700 text-white font-semibold shadow hover:bg-blue-600 transition"
            onClick={() => navigate('/news')}
          >
            ← Back to News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-950 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl bg-gray-900/90 rounded-2xl shadow-2xl border-2 border-blue-700/60 p-8 flex flex-col gap-4"
        >
          <button
            className="mb-4 text-blue-400 hover:underline text-sm self-start"
            onClick={() => navigate('/news')}
          >
            ← Back to News
          </button>
          <h1 className="text-3xl font-extrabold text-blue-200 mb-2 break-words">{article.title}</h1>
          <div className="flex items-center gap-3 text-blue-400 text-sm flex-wrap mb-4">
            {article.author && (
              <>
                <span className="font-semibold">{article.author}</span>
                <span>•</span>
              </>
            )}
            <span>{new Date(article.date).toLocaleDateString()}</span>
            {article.category && (
              <>
                <span>•</span>
                <span>{article.category}</span>
              </>
            )}
            {article.severity && (
              <span className={`ml-2 px-2 py-1 rounded text-xs font-bold shadow ${
                article.severity === 'Critical' ? 'bg-red-700 text-white' : 
                article.severity === 'High' ? 'bg-orange-600 text-white' : 
                article.severity === 'Moderate' ? 'bg-yellow-600 text-white' : 
                'bg-blue-700 text-white'
              }`}>{article.severity}</span>
            )}
          </div>
          {article.image && (
            <img src={article.image} alt={article.title} className="w-full h-64 object-cover rounded-xl mb-4 bg-gray-800" />
          )}
          <div className="prose prose-lg dark:prose-invert max-w-none text-blue-100 text-xl leading-relaxed whitespace-pre-line">
            {article.content || article.summary}
          </div>
          {(article.cves?.length > 0 || article.iocs?.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {article.cves?.map(cve => (
                <span key={cve} className="bg-red-900/80 text-red-200 px-2 py-0.5 rounded text-xs font-mono">{cve}</span>
              ))}
              {article.iocs?.map(ioc => (
                <span key={ioc} className="bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded text-xs font-mono">{ioc}</span>
              ))}
            </div>
          )}
          {article.link && article.link !== '#' && (
            <a 
              href={article.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-4 inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span className="underline">Read original source</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default NewsArticlePage;
