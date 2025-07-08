import React from 'react';
import { motion } from 'framer-motion';

interface NewsCardProps {
  title: string;
  summary: string;
  image?: string;
  date: string;
  source?: string;
  category?: string;
  onClick?: () => void;
}

const fallbackImage = 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80';

const NewsCard: React.FC<NewsCardProps> = ({ 
  title, 
  summary, 
  image, 
  date, 
  source, 
  category,
  onClick 
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative h-full rounded-xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 flex flex-col"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`${title} - Read more`}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={image || fallbackImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={e => (e.currentTarget.src = fallbackImage)}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {category && (
          <span className="absolute top-3 left-3 px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
            {category}
          </span>
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2 leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">{summary}</p>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">{new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}</span>
            {source && (
              <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded-full">
                {source}
              </span>
            )}
          </div>
          <span className="text-blue-400 text-sm font-medium inline-flex items-center group-hover:translate-x-1 transition-transform">
            Read more
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </motion.article>
  );
};

export default NewsCard;
