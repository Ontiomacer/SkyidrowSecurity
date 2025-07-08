import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import cybernewsArticles from '@/services/cybernews_articles.json';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { GuardianNewsArticle } from '@/services/GuardianNewsService';
import { slugify } from './utils';

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

  // Try to get article from location state (if navigated from modal)
  const stateArticle = location.state?.article as UnifiedNews | undefined;

  // Fallback: search all sources by id
  const allCyber: UnifiedNews[] = (cybernewsArticles as { id: string; title: string; summary: string; url: string; date: string; image: string; source: string; }[]).map(a => ({
    id: a.id || slugify(a.title),
    title: a.title,
    author: a.source || 'CyberNews',
    date: a.date || '',
    category: 'Cyber Security',
    link: a.url,
    image: a.image,
    summary: a.summary,
    content: a.summary,
    isLive: false,
  }));

  // If NEWS_CARDS is not imported, copy the static cards here (moved inside useMemo)

  // Try to find the article by id
  const article: UnifiedNews | undefined = useMemo(() => {
    const allStatic = [
      {
        id: slugify('Stealthy WordPress Malware Delivers Windows Trojan via PHP Backdoor'),
        title: 'Stealthy WordPress Malware Delivers Windows Trojan via PHP Backdoor',
        author: 'Tushar Subhra Dutta',
        date: 'July 1, 2025',
        category: 'Cyber Security',
        link: '#',
        image: 'https://www.bleepstatic.com/content/hl-images/2023/11/20/wordpress-malware.jpg',
        summary: 'A sophisticated multi-stage malware campaign has been discovered targeting WordPress websites, employing an intricate infection chain that delivers Windows trojans to unsuspecting visitors.',
        content: `Security researchers have uncovered a new malware campaign targeting WordPress sites. The attackers use a PHP backdoor to inject malicious code, which redirects visitors to sites hosting Windows trojans. The infection chain is multi-stage, making detection difficult. Site owners are urged to update plugins and monitor for suspicious activity.`
      },
      {
        id: slugify('MongoDB Server Pre-Authentication Vulnerability Let Attackers Trigger DoS'),
        title: 'MongoDB Server Pre-Authentication Vulnerability Let Attackers Trigger DoS',
        author: 'Kaaviya',
        date: 'June 27, 2025',
        category: 'Cyber Security',
        link: '#',
        image: 'https://www.mongodb.com/assets/images/global/leaf.png',
        summary: 'A critical pre-auth vulnerability in MongoDB Server could allow remote attackers to trigger denial-of-service conditions, impacting cloud and on-prem deployments.',
        content: `A newly disclosed vulnerability in MongoDB Server allows unauthenticated attackers to send specially crafted requests, causing the server to crash. MongoDB has released patches and urges all users to update immediately. The flaw is tracked as CVE-2025-12345.`
      },
      {
        id: slugify('2,000+ Devices Hacked Using Weaponized Social Security Statement'),
        title: '2,000+ Devices Hacked Using Weaponized Social Security Statement',
        author: 'Tushar Subhra Dutta',
        date: 'June 24, 2025',
        category: 'Cyber Security News',
        link: '#',
        image: 'https://www.securityweek.com/wp-content/uploads/2023/10/social-security-hack.jpg',
        summary: 'Threat actors have exploited fake Social Security statement emails to deliver info-stealer malware, compromising over 2,000 devices in a new phishing campaign.',
        content: `Researchers have observed a surge in phishing emails mimicking official Social Security statements. The emails contain malicious attachments that, when opened, install info-stealer malware. Over 2,000 devices have been compromised, with stolen credentials being sold on dark web forums.`
      }
    ];
    if (stateArticle) return stateArticle;
    if (!id) return undefined;
    // Try cybernews
    const foundCyber = allCyber.find(a => a.id === id);
    if (foundCyber) return foundCyber;
    // Try static
    const foundStatic = allStatic.find(a => a.id === id);
    if (foundStatic) return foundStatic;
    // Try static by slugified title
    const foundStaticBySlug = allStatic.find(a => slugify(a.title) === id);
    if (foundStaticBySlug) return foundStaticBySlug;
    // Try cyber by slugified title
    const foundCyberBySlug = allCyber.find(a => slugify(a.title) === id);
    if (foundCyberBySlug) return foundCyberBySlug;
    return undefined;
  }, [id, stateArticle, allCyber]);

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-blue-200 text-xl">Article not found.</div>
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
          className="w-full max-w-2xl bg-gray-900/90 rounded-2xl shadow-2xl border-2 border-blue-700/60 p-8 flex flex-col gap-4"
        >
          <button
            className="mb-4 text-blue-400 hover:underline text-sm self-start"
            onClick={() => navigate(-1)}
          >
            ← Back to News
          </button>
          <h1 className="text-3xl font-extrabold text-blue-200 mb-2 break-words">{article.title}</h1>
          <div className="flex items-center gap-2 text-blue-400 text-xs mb-4 flex-wrap">
            <span className="font-semibold">{article.author}</span>
            <span>-</span>
            <span>{article.date}</span>
          </div>
          {article.image && (
            <img src={article.image} alt={article.title} className="w-full h-56 object-cover rounded mb-4 bg-gray-800" />
          )}
          <p className="text-blue-100 mb-4 whitespace-pre-line break-words">{article.content || article.summary}</p>
          {article.link && article.link !== '#' && (
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="block text-blue-400 underline mb-4">Read original source</a>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default NewsArticlePage;
