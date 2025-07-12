import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiBookmark, FiShare2, FiExternalLink } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  title: string;
  summary: string;
  image?: string;
  date: string;
  source?: string;
  category?: string;
  severity?: 'Critical' | 'High' | 'Moderate' | 'Low';
  onClick?: () => void;
}

const fallbackImage = 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80';

const getSeverityColor = (severity?: string) => {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'high':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'moderate':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'low':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    default:
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  }
};

const NewsCard: React.FC<NewsCardProps> = ({ 
  title, 
  summary, 
  image, 
  date, 
  source, 
  category,
  severity,
  onClick 
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onClick) {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    // TODO: Implement actual bookmark functionality
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: title,
        text: summary,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      // Show a toast or notification that link was copied
    }
  };

  const formattedDate = formatDistanceToNow(new Date(date), { addSuffix: true });
  const severityColor = getSeverityColor(severity);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="group relative h-full rounded-xl overflow-hidden bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 flex flex-col backdrop-blur-sm"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`${title} - Read more`}
    >
      {/* Image with overlay */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <img
          src={image || fallbackImage}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
          onError={e => (e.currentTarget.src = fallbackImage)}
          loading="lazy"
        />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-start">
          {category && (
            <span className="px-2.5 py-1 text-xs font-medium bg-gray-900/80 text-white rounded-full backdrop-blur-sm border border-gray-700/50">
              {category}
            </span>
          )}
          
          <div className="flex space-x-2">
            {severity && (
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${severityColor} backdrop-blur-sm`}>
                {severity}
              </span>
            )}
          </div>
        </div>
        
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/90 to-transparent z-10" />
        
        {/* Quick actions */}
        <div className={`absolute bottom-3 right-3 z-20 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`}>
          <button 
            onClick={handleBookmark}
            className="p-2 rounded-full bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-800/90 transition-colors"
            aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
          >
            <FiBookmark 
              className={`w-4 h-4 ${isBookmarked ? 'fill-blue-400 text-blue-400' : 'text-gray-300'}`} 
            />
          </button>
          <button 
            onClick={handleShare}
            className="p-2 rounded-full bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-800/90 transition-colors"
            aria-label="Share article"
          >
            <FiShare2 className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2 leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <p className="text-gray-300 text-sm mb-4 line-clamp-3">{summary}</p>
        </div>
        
        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-xs text-gray-400">
              <FiClock className="w-3.5 h-3.5 mr-1" />
              <span>{formattedDate}</span>
            </div>
            {source && (
              <span className="text-xs px-2 py-1 bg-gray-800/50 text-gray-300 rounded-full border border-gray-700/50">
                {source}
              </span>
            )}
          </div>
          <span className="text-blue-400 text-sm font-medium inline-flex items-center group-hover:translate-x-1 transition-transform">
            Read more
            <FiExternalLink className="w-4 h-4 ml-1" />
          </span>
        </div>
      </div>
    </motion.article>
  );
};

export default NewsCard;
